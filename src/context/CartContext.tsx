// src/context/CartContext.tsx

import { APP_CONFIG } from '@/config/app';
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CartContextType {
    cart: { [key: string]: number };
    addToCart: (productId: string) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    deliveryType: 'entrega' | 'retirada';
    setDeliveryType: (type: 'entrega' | 'retirada') => void;
    getDeliveryFee: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<{ [key: string]: number }>({});
    const [deliveryType, setDeliveryType] = useState<'entrega' | 'retirada'>('retirada');

    const addToCart = (productId: string) => {
        setCart(prev => ({
            ...prev,
            [productId]: (prev[productId] || 0) + 1
        }));
    };

    const getDeliveryFee = () => {
        return deliveryType === 'entrega' ? APP_CONFIG.DELIVERY_FEE : 0;
    };

    const getTotalWithDelivery = () => {
        // TODO: Calculate total with delivery fee
        return 0;
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => {
            const newCart = { ...prev };
            delete newCart[productId];
            return newCart;
        });
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
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
            getDeliveryFee
        }}>
            {children}
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