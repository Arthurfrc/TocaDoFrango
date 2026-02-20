// src/types/index.ts

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image?: string;
    available: boolean;
}

export interface CartItem extends Product {
    quantity: number;
}

export interface Order {
    id: string;
    items: CartItem[];
    total: number;
    customerName: string;
    customerPhone: string;
    customerPaymentMethod: string;
    status: 'pending' | 'preparing' | 'ready' | 'completed';
    createdAt: Date;
}