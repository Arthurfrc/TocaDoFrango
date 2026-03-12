import { configService } from "@/services/configService";

export const adminNumber = async (): Promise<string> => {
    try {
        const config = await configService.getConfig();
        return config.whatsappNumber;
    } catch (error) {
        console.error('Erro ao carregar número do WhatsApp: ', error);
        return '5584999397770';
    }
}