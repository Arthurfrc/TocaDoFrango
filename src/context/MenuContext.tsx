// src/context/MenuContext.tsx

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Alert } from 'react-native';
import { onSnapshot, collection } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Product, Category } from '@/types';
import { getCategoryName } from '@/utils';
import { menuService, categoriesService } from '@/services/menuService';
import { imageService } from '@/services/imageService';

interface MenuContextType {
    products: Product[];
    addProduct: (product: Product) => void;
    updateProduct: (productId: string, product: Product) => void;
    deleteProduct: (productId: string) => void;
    toggleProductAvailability: (productId: string) => void;
    updateProductStock: (productId: string, newStock: number) => void;

    hasUnsavedChanges: boolean;
    publishChanges: () => Promise<void>;
    discardChanges: () => Promise<void>;
    isPublishing: boolean;
    isLoading: boolean;

    categories: Category[];
    addCategory: (category: Category) => void;
    updateCategory: (categoryId: string, category: Category) => void;
    deleteCategory: (categoryId: string) => void;

    syncFromFirebase: () => Promise<{
        products: Product[];
        categories: Category[];
    }>
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuProvider({ children }: { children: ReactNode }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const syncFromFirebase = async () => {
        try {
            const freshProducts = await menuService.getMenu();
            const freshCategories = await categoriesService.getCategories();

            setProducts(freshProducts);
            setCategories(freshCategories);

            return {
                products: freshProducts,
                categories: freshCategories
            }
        } catch (error) {
            throw error;
        }
    }

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
            const productsToSave = await Promise.all(
                (products || []).map(async (product) => {
                    if (product.image?.startsWith('file://')) {
                        const url = await imageService.uploadImage(product.id, product.image);
                        return { ...product, image: url };
                    }
                    return product;
                })
            );

            setProducts(productsToSave);

            await Promise.all([
                menuService.saveMenu(productsToSave),
                categoriesService.saveAllCategories(categories || [])
            ]);

            setHasUnsavedChanges(false);
            Alert.alert('✅ Sucesso!', 'Alterações publicadas com sucesso!');
        } catch (error) {
            const msg = JSON.stringify(error) || 'Erro desconhecido';
            console.error('Erro ao publicar:', msg);
            Alert.alert('❌ Erro!', msg);
            // console.error('Erro ao publicar alterações:', error);
            // Alert.alert('❌ Erro!', 'Erro ao publicar alterações!');
        } finally {
            setIsPublishing(false);
        }
    }

    const discardChanges = async () => {
        try {
            await syncFromFirebase();
            setHasUnsavedChanges(false);
        } catch (error) {
            Alert.alert('❌ Erro', 'Não foi possível descartar as alterações');
        }
    }

    useEffect(() => {
        setIsLoading(true);

        // Listener em tempo real para produtos
        const unsubscribeProducts = onSnapshot(collection(db, 'menu'), (snapshot) => {
            const productsData = snapshot.docs.map(doc => doc.data() as Product);
            setProducts(productsData); // ✅ Salva SEM ordenar
            setIsLoading(false);
        }, (error) => {
            console.error('Erro no listener de produtos:', error);
            setIsLoading(false);
        });

        // Listener em tempo real para categorias
        const unsubscribeCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
            const categoriesData = snapshot.docs.map(doc => doc.data() as Category);
            setCategories(categoriesData.sort((a, b) => a.name.localeCompare(b.name)));
        }, (error) => {
            console.error('Erro no listener de categorias:', error);
        });

        return () => {
            unsubscribeProducts();
            unsubscribeCategories();
        };
    }, []);

    // ✅ Reordena produtos sempre que produtos OU categorias mudarem
    useEffect(() => {
        if (products.length > 0 && categories.length > 0) {
            const sortedProducts = [...products].sort((a, b) => {
                const categoryCompare = (getCategoryName(a, categories) || '').localeCompare(getCategoryName(b, categories) || '');
                if (categoryCompare !== 0) return categoryCompare;
                return a.name.localeCompare(b.name);
            });

            // Só atualiza se a ordem realmente mudou
            const currentIds = products.map(p => p.id).join(',');
            const sortedIds = sortedProducts.map(p => p.id).join(',');

            if (currentIds !== sortedIds) {
                setProducts(sortedProducts);
            }
        }
    }, [products.length, categories.length]); // ✅ Dependências corretas

    return (
        <MenuContext.Provider value={{
            products: products || [],
            addProduct,
            updateProduct,
            deleteProduct,
            categories: categories || [],
            syncFromFirebase,
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