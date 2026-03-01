// src/context/MenuContext.tsx

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Alert } from 'react-native';
import { Product, Category } from '@/types';
import { getCategoryName } from '@/utils';
import { menuService, categoriesService } from '@/services/menuService';

interface MenuContextType {
    products: Product[];
    addProduct: (product: Product) => void;
    updateProduct: (productId: string, product: Product) => void;
    deleteProduct: (productId: string) => void;
    toggleProductAvailability: (productId: string) => void;
    updateProductStock: (productId: string, newStock: number) => void;

    hasUnsavedChanges: boolean;
    publishChanges: () => Promise<void>;
    discardChanges: () => void;
    isPublishing: boolean;
    isLoading: boolean;

    categories: Category[];
    addCategory: (category: Category) => void;
    updateCategory: (categoryId: string, category: Category) => void;
    deleteCategory: (categoryId: string) => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuProvider({ children }: { children: ReactNode }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const addProduct = (product: Product) => {
        setProducts(prev => [...(prev || []), product].sort((a, b) => {
            // 1. Ordena por categoria
            const categoryCompare = (getCategoryName(a, categories || []) || '').localeCompare(getCategoryName(b, categories || []) || '');
            if (categoryCompare !== 0) return categoryCompare;

            // 2. Se mesma categoria, ordena por nome
            return a.name.localeCompare(b.name);
        }));
        setHasUnsavedChanges(true);
    };

    const updateProduct = (productId: string, updatedProduct: Product) => {
        setProducts(prev =>
            (prev || []).map(p => p.id === productId ? updatedProduct : p)
                .sort((a, b) => {
                    // 1. Ordena por categoria
                    const categoryCompare = (getCategoryName(a, categories || []) || '').localeCompare(getCategoryName(b, categories || []) || '');
                    if (categoryCompare !== 0) return categoryCompare;

                    // 2. Se mesma categoria, ordena por nome
                    return a.name.localeCompare(b.name);
                })
        );
        setHasUnsavedChanges(true);
    };

    const deleteProduct = (productId: string) => {
        setProducts(prev => (prev || []).filter(p => p.id !== productId));
        setHasUnsavedChanges(true);
    };

    const addCategory = (category: Category) => {
        setCategories(prev => [...(prev || []), category].sort((a, b) => a.name.localeCompare(b.name)));
        setHasUnsavedChanges(true);
    };

    const updateCategory = (categoryId: string, updatedCategory: Category) => {
        setCategories(prev =>
            (prev || []).map(c => c.id === categoryId ? updatedCategory : c)
                .sort((a, b) => a.name.localeCompare(b.name))
        );
        setHasUnsavedChanges(true);
    };

    const deleteCategory = (categoryId: string) => {
        setCategories(prev => (prev || []).filter(c => c.id !== categoryId));
        setHasUnsavedChanges(true);
    };

    const toggleProductAvailability = (productId: string) => {
        setProducts(prev =>
            (prev || []).map(p =>
                p.id === productId ? { ...p, available: !p.available } : p
            )
        );
        setHasUnsavedChanges(true);
    };

    const updateProductStock = (productId: string, newStock: number) => {
        setProducts(prev =>
            (prev || []).map(p =>
                p.id === productId ? { ...p, stock: newStock } : p
            )
        );
        // Não marca como alteração não salva pois é atualização automática de estoque
    };

    const publishChanges = async () => {
        setIsPublishing(true);
        try {
            // Aqui vai a lógica do Firebase depois
            console.log('Publicando alterações...');
            await Promise.all([
                menuService.saveMenu(products || []),
                categoriesService.saveAllCategories(categories || [])
            ]);
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
        setHasUnsavedChanges(false);
    }

    useEffect(() => {
        const loadData = async () => {
            try {
                const [menuData, categoriesData] = await Promise.all([
                    menuService.getMenu(),
                    categoriesService.getCategories()
                ])
                // Ordenar produtos
                setProducts(menuData.sort((a, b) => {
                    // 1. Ordena por categoria
                    const categoryCompare = (getCategoryName(a, categoriesData) || '').localeCompare(getCategoryName(b, categoriesData) || '');
                    if (categoryCompare !== 0) return categoryCompare;

                    // 2. Se mesma categoria, ordena por nome
                    return a.name.localeCompare(b.name);
                }));

                // Ordenar categorias
                setCategories(categoriesData.sort((a, b) => a.name.localeCompare(b.name)));

            } catch (error) {
                console.error('Erro ao carregar menu:', error);
                setProducts([]);
                setCategories([]);
                Alert.alert('Modo Offline', 'Conecte-se à internet para atualizar o cardápio.');
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    return (
        <MenuContext.Provider value={{
            products: products || [],
            addProduct,
            updateProduct,
            deleteProduct,
            categories: categories || [],
            addCategory,
            updateCategory,
            deleteCategory,
            toggleProductAvailability,
            updateProductStock,
            hasUnsavedChanges,
            publishChanges,
            discardChanges,
            isPublishing,
            isLoading
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