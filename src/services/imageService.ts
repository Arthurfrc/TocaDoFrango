// src/services/imageService.ts

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/config/firebase';

export const imageService = {
    async uploadImage(productId: string, imageUri: string): Promise<string> {
        try {
            const blob = await new Promise<Blob>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.onload = () => resolve(xhr.response);
                xhr.onerror = () => reject(new Error('Falha ao carregar imagem!'));
                xhr.responseType = 'blob';
                xhr.open('GET', imageUri, true);
                xhr.send(null);
            });

            const storageRef = ref(storage, `products/${productId}.jpg`);
            await uploadBytes(storageRef, blob);

            const downloadURL = await getDownloadURL(storageRef);
            return downloadURL;
        } catch (error) {
            console.error('Erro ao fazer upload da imagem:', error);
            throw error;
        }
    }
};