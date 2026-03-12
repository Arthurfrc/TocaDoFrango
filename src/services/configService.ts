import { doc, getDoc, setDoc, collection } from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface ConfigData {
    whatsappNumber: string;
    updatedAt: Date;
}

const CONFIG_COLLECTION = 'config';
const CONFIG_DOC_ID = 'admin';

export const configService = {
    // Buscar configurações do Firebase
    async getConfig(): Promise<ConfigData> {
        try {
            const configDoc = doc(db, CONFIG_COLLECTION, CONFIG_DOC_ID);
            const configSnapshot = await getDoc(configDoc);

            if (configSnapshot.exists()) {
                return configSnapshot.data() as ConfigData;
            } else {
                // Se não existir, retorna configuração padrão
                return {
                    whatsappNumber: '5584999397770',
                    updatedAt: new Date()
                };
            }
        } catch (error) {
            console.error('Erro ao buscar configurações:', error);
            return {
                whatsappNumber: '5584999397770',
                updatedAt: new Date()
            };
        }
    },

    // Salvar configurações no Firebase
    async saveConfig(config: Partial<ConfigData>): Promise<void> {
        try {
            const configDoc = doc(db, CONFIG_COLLECTION, CONFIG_DOC_ID);
            const currentConfig = await this.getConfig();

            const updatedConfig: ConfigData = {
                ...currentConfig,
                ...config,
                updatedAt: new Date()
            };

            await setDoc(configDoc, updatedConfig);
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
            throw error;
        }
    },

    // Salvar apenas o número do WhatsApp
    async saveWhatsAppNumber(number: string): Promise<void> {
        await this.saveConfig({ whatsappNumber: number });
    }
};