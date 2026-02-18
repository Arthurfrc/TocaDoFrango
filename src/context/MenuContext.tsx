// src/context/MenuContext.tsx

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Alert } from 'react-native';
import { Product } from '@/types';
import { MENU_DATA } from '@/data/menu';

interface MenuContextType {
    products: Product[];
    addProduct: (product: Product) => void;
    updateProduct: (productId: string, product: Product) => void;
    deleteProduct: (productId: string) => void;
    toggleProductAvailability: (productId: string) => void;

    hasUnsavedChanges: boolean;
    publishChanges: () => Promise<void>;
    discardChanges: () => void;
    isPublishing: boolean;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuProvider({ children }: { children: ReactNode }) {
    const [products, setProducts] = useState<Product[]>(MENU_DATA);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    const addProduct = (product: Product) => {
        setProducts(prev => [...prev, product]);
        setHasUnsavedChanges(true);
    };

    const updateProduct = (productId: string, updatedProduct: Product) => {
        setProducts(prev =>
            prev.map(p => p.id === productId ? updatedProduct : p)
        );
        setHasUnsavedChanges(true);
    };

    const deleteProduct = (productId: string) => {
        setProducts(prev => prev.filter(p => p.id !== productId));
        setHasUnsavedChanges(true);
    };

    const toggleProductAvailability = (productId: string) => {
        setProducts(prev =>
            prev.map(p =>
                p.id === productId ? { ...p, available: !p.available } : p
            )
        );
        setHasUnsavedChanges(true);
    };

    const publishChanges = async () => {
        setIsPublishing(true);
        try {
            // Aqui vai a lógica do Firebase depois
            console.log('Publicando alterações...');
            setHasUnsavedChanges(false);
            Alert.alert('✅ Sucesso!', 'Alterações publicadas com sucesso!');

        } catch (error) {
            console.error('Erro ao publicar alterações:', error);
            Alert.alert('❌ Erro!', 'Erro ao publicar alterações!');
        } finally {
            setIsPublishing(false);
        }
    }

    const discardChanges = () => {
        setProducts(MENU_DATA);
        setHasUnsavedChanges(false);
    }

    return (
        <MenuContext.Provider value={{
            products,
            addProduct,
            updateProduct,
            deleteProduct,
            toggleProductAvailability,
            hasUnsavedChanges,
            publishChanges,
            discardChanges,
            isPublishing
        }}>
            {children}
        </MenuContext.Provider>
    );
}

export function useMenu() {
    const context = useContext(MenuContext);
    if (context === undefined) {
        throw new Error('useMenu must be used within a MenuProvider');
    }
    return context;
}