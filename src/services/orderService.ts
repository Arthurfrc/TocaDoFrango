// src/services/orderService.ts

import { collection, doc, setDoc, getDocs, updateDoc, deleteDoc, query, orderBy, limit, where, Timestamp, writeBatch } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { DeliveryZone } from '@/services/deliveryService';

// Interface para os itens do pedido
export interface OrderItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    category?: string;
}

// Interface principal do pedido
export interface Order {
    id: string;
    items: OrderItem[];
    subtotal: number;
    deliveryFee: number;
    total: number;
    deliveryType: 'entrega' | 'retirada';
    deliveryZone?: DeliveryZone;
    customerInfo: {
        name: string;
        phone: string;
        address?: string;
    };
    status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
    createdAt: Date;
    updatedAt: Date;
}

// Interface para estatísticas
export interface OrderStats {
    totalOrders: number;
    totalRevenue: number;
    averageTicket: number;
    ordersByStatus: Record<Order['status'], number>;
    deliveryVsRetirada: { entrega: number; retirada: number };
    topProducts: Array<{ name: string; quantity: number; revenue: number }>;
    revenueByDay: Array<{ date: string; revenue: number; orders: number }>;
}

const ORDERS_COLLECTION = 'orders';

export const orderService = {
    // Função para salvar um novo pedido
    async saveOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const newOrder: Order = {
            ...order,
            id: orderId,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const docRef = doc(db, ORDERS_COLLECTION, orderId);
        await setDoc(docRef, newOrder);

        return orderId;
    },

    // Função para buscar todos os pedidos
    async getOrders(): Promise<Order[]> {
        const querySnapshot = await getDocs(collection(db, ORDERS_COLLECTION));
        return querySnapshot.docs.map(doc => {
            const data = doc.data() as Order;
            const createdAt = data.createdAt instanceof Date
                ? data.createdAt
                : (data.createdAt as any).toDate?.() || new Date();

            const updatedAt = data.updatedAt instanceof Date
                ? data.updatedAt
                : (data.updatedAt as any).toDate?.() || new Date();

            return {
                ...data,
                createdAt,
                updatedAt,
            };
        });
    },

    // Função para atualizar status do pedido
    async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
        const docRef = doc(db, ORDERS_COLLECTION, orderId);
        await updateDoc(docRef, {
            status,
            updatedAt: new Date(),
        });
    },

    // Funções para estatísticas
    async getOrderStats(days: number = 30): Promise<OrderStats> {
        const orders = await this.getOrders();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        const filteredOrders = orders.filter(order => order.createdAt >= cutoffDate);

        // Total de pedidos e faturamento
        const totalOrders = filteredOrders.length;
        const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
        const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Pedidos por status
        const ordersByStatus = filteredOrders.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
        }, {} as Record<Order['status'], number>);

        // Entrega vs Retirada
        const deliveryVsRetirada = filteredOrders.reduce(
            (acc, order) => {
                if (order.deliveryType === 'entrega') {
                    acc.entrega++;
                } else {
                    acc.retirada++;
                }
                return acc;
            },
            { entrega: 0, retirada: 0 }
        );

        // Produtos mais vendidos
        const productStats = new Map<string, { quantity: number; revenue: number }>();

        filteredOrders.forEach(order => {
            order.items.forEach(item => {
                const existing = productStats.get(item.name) || { quantity: 0, revenue: 0 };
                productStats.set(item.name, {
                    quantity: existing.quantity + item.quantity,
                    revenue: existing.revenue + (item.price * item.quantity)
                });
            });
        });

        const topProducts = Array.from(productStats.entries())
            .map(([name, stats]) => ({ name, ...stats }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10);

        // Faturamento por dia
        const revenueByDay = new Map<string, { revenue: number; orders: number }>();

        filteredOrders.forEach(order => {
            const dateKey = order.createdAt.toISOString().split('T')[0];
            const existing = revenueByDay.get(dateKey) || { revenue: 0, orders: 0 };
            revenueByDay.set(dateKey, {
                revenue: existing.revenue + order.total,
                orders: existing.orders + 1
            });
        });

        const revenueByDayArray = Array.from(revenueByDay.entries())
            .map(([date, stats]) => ({ date, ...stats }))
            .sort((a, b) => a.date.localeCompare(b.date));

        return {
            totalOrders,
            totalRevenue,
            averageTicket,
            ordersByStatus,
            deliveryVsRetirada,
            topProducts,
            revenueByDay: revenueByDayArray
        };
    },

    // Função para limpar pedidos antigos (otimização)
    async deleteOldOrders(daysToKeep: number = 180): Promise<number> {
        const orders = await this.getOrders();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

        const oldOrders = orders.filter(order => order.createdAt < cutoffDate);

        if (oldOrders.length === 0) return 0;

        const batch = writeBatch(db);
        oldOrders.forEach(order => {
            const docRef = doc(db, ORDERS_COLLECTION, order.id);
            batch.delete(docRef);
        });

        await batch.commit();
        return oldOrders.length;
    },
};