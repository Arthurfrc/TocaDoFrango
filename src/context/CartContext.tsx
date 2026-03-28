// src/context/CartContext.tsx

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '@/types';
import { menuService } from '@/services/menuService';
import CustomAlert from '@/components/CustomAlert';
import { DeliveryZone } from '@/services/deliveryService';

interface CartContextType {
    cart: { [key: string]: number };
    addToCart: (productId: string, products: Product[]) => boolean;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number, products: Product[]) => void;
    clearCart: () => void;
    deliveryType: 'entrega' | 'retirada' | null;
    setDeliveryType: (type: 'entrega' | 'retirada' | null) => void;
    getDeliveryFee: () => number;
    decreaseStock: (productId: string, products: Product[], quantity?: number) => Promise<void>;
    checkStockAvailability: (cartItems: any[]) => Promise<{ available: boolean, message?: string }>;
    selectedDeliveryZone: DeliveryZone | null;
    setSelectedDeliveryZone: (zone: DeliveryZone | null) => void;
    selectedDeliveryZoneId: string | null;
    setSelectedDeliveryZoneId: (zoneId: string | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<{ [key: string]: number }>({});
    const [deliveryType, setDeliveryType] = useState<'entrega' | 'retirada' | null>(null);
    const [selectedDeliveryZone, setSelectedDeliveryZone] = useState<DeliveryZone | null>(null);
    const [selectedDeliveryZoneId, setSelectedDeliveryZoneId] = useState<string | null>(null);

    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ title: '', message: '' });

    const addToCart = (productId: string, products: Product[]): boolean => {
        const product = products.find(p => p.id === productId);

        if (product?.hasStockControl) {
            const currentQuantity = cart[productId] || 0;
            if (currentQuantity >= (product.stock || 0)) {
                setAlertConfig({
                    title: '❌ Estoque Esgotado',
                    message: 'Este produto não tem mais unidades disponíveis no momento!'
                });
                setAlertVisible(true);
                return false;
            }
        }
        setCart(prev => ({
            ...prev,
            [productId]: (prev[productId] || 0) + 1
        }));
        return true;
    };

    const decreaseStock = async (productId: string, products: Product[], quantity = 1) => {
        // Busca dados atualizados do Firebase
        const currentProducts = await menuService.getMenu();
        const product = currentProducts.find(p => p.id === productId);

        if (product?.hasStockControl && product.stock !== undefined) {
            const newStock = Math.max(0, product.stock - quantity);

            try {
                // Atualiza no Firebase
                await menuService.updateProductStock(productId, newStock);
            } catch (error) {
                console.error('Erro ao atualizar estoque:', error);
                setAlertConfig({
                    title: '❌ Erro',
                    message: 'Não foi possível atualizar o estoque'
                });
                setAlertVisible(true);
            }
        }
    };

    const getDeliveryFee = () => {
        if (deliveryType === 'retirada') return 0;
        if (selectedDeliveryZone) return selectedDeliveryZone.price;
        return 0;
    };

    const checkStockAvailability = async (cartItems: any[]): Promise<{ available: boolean, message?: string }> => {
        const outOfStockProducts = [];

        // Buscar produtos ATUAIS do Firebase
        const currentProducts = await menuService.getMenu();

        for (const item of cartItems) {
            if (item.hasStockControl) {
                const freshProduct = currentProducts.find(p => p.id === item.id);
                const availableStock = freshProduct?.stock || 0;

                if (availableStock < item.quantity) {
                    outOfStockProducts.push({
                        name: item.name,
                        available: availableStock,
                        requested: item.quantity
                    });
                }
            }
        }

        if (outOfStockProducts.length > 0) {
            let message = '❌ Produtos sem estoque suficiente:\n';
            outOfStockProducts.forEach(product => {
                message += `🍗 ${product.name}\n`;
                message += `📦 Disponível: ${product.available} unidade(s)\n`;
                message += `🛒 Pedido: ${product.requested} unidade(s)\n`;
            });
            message += '💡 Por favor, ajuste seu carrinho para continuar.';

            return { available: false, message };
        }

        return { available: true };
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => {
            const newCart = { ...prev };
            delete newCart[productId];
            return newCart;
        });
    };

    const updateQuantity = (productId: string, quantity: number, products: Product[]) => {
        
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            const product = products.find(p => p.id === productId);
            if (product?.hasStockControl && quantity > (product.stock || 0)) {
                setAlertConfig({
                    title: '❌ Estoque Insuficiente',
                    message: `Apenas ${product.stock} unidade(s) disponível(is)!`
                });
                setAlertVisible(true);
                return;
            }
            setCart(prev => ({
                ...prev,
                [productId]: quantity
            }));
        }
    };

    const clearCart = () => {
        setCart({});
    };

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            deliveryType,
            setDeliveryType,
            getDeliveryFee,
            decreaseStock,
            checkStockAvailability,
            selectedDeliveryZone,
            setSelectedDeliveryZone,
            selectedDeliveryZoneId,
            setSelectedDeliveryZoneId
        }}>
            {children}
            <CustomAlert
                visible={alertVisible}
                title={alertConfig.title}
                message={alertConfig.message}
                onConfirm={() => setAlertVisible(false)}
                onCancel={() => setAlertVisible(false)}
            />
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
