// src/services/deliveryService.ts

import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface DeliveryZone {
    id?: string;
    name: string;
    price: number;
    active: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const DELIVERY_ZONES = 'bairros';

export const deliveryService = {
    // Buscar todas as zonas de entrega
    async getDeliveryZones(): Promise<DeliveryZone[]> {
        const q = query(collection(db, DELIVERY_ZONES), orderBy('name'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as DeliveryZone[];
    },

    // Buscar apenas zonas ativas
    async getActiveDeliveryZones(): Promise<DeliveryZone[]> {
        const zones = await this.getDeliveryZones();
        return zones.filter(zone => zone.active);
    },

    // Adicionar nova zona
    async addDeliveryZone(zone: Omit<DeliveryZone, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        const docRef = await addDoc(collection(db, DELIVERY_ZONES), {
            ...zone,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        return docRef.id;
    },

    // Atualizar zona
    async updateDeliveryZone(id: string, zone: Partial<DeliveryZone>): Promise<void> {
        await updateDoc(doc(db, DELIVERY_ZONES, id), {
            ...zone,
            updatedAt: new Date()
        });
    },

    // Remover zona
    async deleteDeliveryZone(id: string): Promise<void> {
        await deleteDoc(doc(db, DELIVERY_ZONES, id));
    },

    // Ativar/desativar zona
    async toggleDeliveryZone(id: string, active: boolean): Promise<void> {
        await updateDoc(doc(db, DELIVERY_ZONES, id), {
            active,
            updatedAt: new Date()
        });
    }
}
