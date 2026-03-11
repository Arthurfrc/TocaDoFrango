import AsyncStorage from "@react-native-async-storage/async-storage";

export const adminNumber = async (): Promise<string> => {
    try {
        const saved = await AsyncStorage.getItem('adminWhatsApp');
        return saved || '5584999397770';
    } catch (error) {
        console.error('Erro ao carregar número do WhatsApp: ', error);
        return '5584999397770';
    }
}