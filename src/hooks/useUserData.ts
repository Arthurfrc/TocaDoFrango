import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface UserData {
    name: string;
    phone: string;
    address: string;
}

// Hook para autocomplete de dados do usuário
const useUserData = () => {
    const [userData, setUserData] = useState<UserData | null>(null);

    const loadUserData = async () => {
        try {
            const saved = await AsyncStorage.getItem('user_data');
            if (saved) {
                const data: UserData = JSON.parse(saved);
                setUserData(data);
                return data;
            }
        } catch (error) {
            console.error('Erro ao carregar dados: ', error);
        }
        return null;
    }

    const saveUserData = async (data: UserData) => {
        try {
            await AsyncStorage.setItem('user_data', JSON.stringify(data));
            setUserData(data);
        } catch (error) {
            console.error('Erro ao salvar dados: ', error);
        }
    }

    return {
        userData,
        loadUserData,
        saveUserData
    }
}

export default useUserData;