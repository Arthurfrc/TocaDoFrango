// src/services/menuService.ts

import { collection, doc, setDoc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Product } from '@/types';

const MENU_COLLECTION = 'menu';

export const menuService = {
    async saveMenu(products: Product[]): Promise<void> {
        const batch: Promise<void>[] = [];

        products.forEach(product => {
            const docRef = doc(db, MENU_COLLECTION, product.id);
            batch.push(setDoc(docRef, product));
        });

        await Promise.all(batch);
    },

    async getMenu(): Promise<Product[]> {
        const querySnapshot = await getDocs(collection(db, MENU_COLLECTION));
        return querySnapshot.docs.map(doc => doc.data() as Product);
    },

    async updateProductStock(productId: string, newStock: number): Promise<void> {
        const docRef = doc(db, MENU_COLLECTION, productId);
        await updateDoc(docRef, { stock: newStock });
    }
};