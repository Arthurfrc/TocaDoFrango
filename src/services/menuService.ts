// src/services/menuService.ts

import { collection, doc, setDoc, getDocs, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Product, Category } from '@/types';

const MENU_COLLECTION = 'menu';
const CATEGORIES_COLLECTION = 'categories';
const PRODUCT_COLLECTION = 'products';

export const menuService = {
    async saveMenu(products: Product[]): Promise<void> {
        const batch = writeBatch(db);

        const currentProducts = await menuService.getMenu();

        currentProducts.forEach(currentProduct => {
            const stillExists = products.some(p => p.id === currentProduct.id);
            if (!stillExists) {
                const docRef = doc(db, MENU_COLLECTION, currentProduct.id);
                batch.delete(docRef);
            }
        })

        products.forEach(product => {
            const docRef = doc(db, MENU_COLLECTION, product.id);
            batch.set(docRef, product);
        });

        await batch.commit();
    },

    async getMenu(): Promise<Product[]> {
        return await productsService.getProducts();
    },

    async updateProductStock(productId: string, newStock: number): Promise<void> {
        await productsService.updateProduct(productId, { stock: newStock });
    }
};

export const categoriesService = {
    async saveCategory(category: Category): Promise<void> {
        const docRef = doc(db, CATEGORIES_COLLECTION, category.id);
        await setDoc(docRef, category);
    },

    async saveAllCategories(categories: Category[]): Promise<void> {
        const batch = writeBatch(db);

        categories.forEach(category => {
            const docRef = doc(db, CATEGORIES_COLLECTION, category.id);
            batch.set(docRef, category);
        })

        await batch.commit();
    },

    async getCategories(): Promise<Category[]> {
        const querySnapshot = await getDocs(collection(db, CATEGORIES_COLLECTION));
        return querySnapshot.docs.map(doc => doc.data() as Category);
    },

    async updateCategory(categoryId: string, updates: Partial<Category>): Promise<void> {
        const docRef = doc(db, CATEGORIES_COLLECTION, categoryId);
        await updateDoc(docRef, updates);
    },

    async deleteCategory(categoryId: string): Promise<void> {
        const docRef = doc(db, CATEGORIES_COLLECTION, categoryId);
        await deleteDoc(docRef);
    }
}

export const productsService = {
    async saveProduct(product: Product): Promise<void> {
        const docRef = doc(db, PRODUCT_COLLECTION, product.id);
        await setDoc(docRef, product);
    },

    async updateProduct(productId: string, updates: Partial<Product>): Promise<void> {
        const docRef = doc(db, PRODUCT_COLLECTION, productId);
        await updateDoc(docRef, updates);
    },

    async deleteProduct(productId: string): Promise<void> {
        const docRef = doc(db, PRODUCT_COLLECTION, productId);
        await deleteDoc(docRef);
    },

    async getProducts(): Promise<Product[]> {
        const querySnapshot = await getDocs(collection(db, PRODUCT_COLLECTION));
        return querySnapshot.docs.map(doc => doc.data() as Product);
    }
};