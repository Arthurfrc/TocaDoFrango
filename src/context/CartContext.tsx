// src/context/CartContext.tsx

import { APP_CONFIG } from '@/config/app';
import { Product } from '@/types';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Alert } from 'react-native';
import { menuService } from '@/services/menuService';


interface CartContextType {
    cart: { [key: string]: number };
    addToCart: (productId: string, products: Product[]) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    deliveryType: 'entrega' | 'retirada';
    setDeliveryType: (type: 'entrega' | 'retirada') => void;
    getDeliveryFee: () => number;
    decreaseStock: (productId: string, products: Product[]) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<{ [key: string]: number }>({});
    const [deliveryType, setDeliveryType] = useState<'entrega' | 'retirada'>('retirada');

    const addToCart = (productId: string, products: Product[]) => {
        const product = products.find(p => p.id === productId);

        if (product?.hasStockControl) {
            const currentQuantity = cart[productId] || 0;
            if (currentQuantity >= (product.stock || 0)) {
                Alert.alert('❌ Estoque Esgotado', 'Este produto não tem mais unidades disponíveis!');
                return;
            }
        }
        setCart(prev => ({
            ...prev,
            [productId]: (prev[productId] || 0) + 1
        }));
    };

    const decreaseStock = async (productId: string, products: Product[]) => {
        const product = products.find(p => p.id === productId);
        if (product?.hasStockControl && product.stock !== undefined) {
            const newStock = Math.max(0, product.stock - 1);

            try {
                // Atualiza no Firebase
                await menuService.updateProductStock(productId, newStock);
                // Atualiza localmente também
                product.stock = newStock;
            } catch (error) {
                console.error('Erro ao atualizar estoque:', error);
                Alert.alert('❌ Erro', 'Não foi possível atualizar o estoque');
            }
        }
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
            getDeliveryFee,
            decreaseStock
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