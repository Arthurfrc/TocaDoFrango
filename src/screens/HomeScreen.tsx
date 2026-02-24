// src/screens/HomeScreen.tsx

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import * as Application from 'expo-application';

import { COLORS } from '@/constants/colors';
import InputAlert from '@/components/InputAlert';

export default function HomeScreen({ navigation }: any) {

    const ADMIN_DEVICE = '1234';
    // const ADMIN_DEVICE = '5de8e407bf4a0f3e';
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [logoPress, setLogoPress] = useState(0);
    const [adminUnlocked, setAdminUnlocked] = useState(false);

    const resetTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const checkId = async () => {
            try {
                const android = await Application.getAndroidId();
                console.log('ID do dispositivo: ', android);
                if (android === ADMIN_DEVICE) {
                    // setShowAdminButton(true);
                    console.log('✅ Dispositivo admin detectado');
                }
            } catch (error) {
                console.error('Erro ao obter ID: ', error);
            }
        }
        checkId();

        // Cleanup do timer quando o componente desmontar
        return () => {
            if (resetTimerRef.current) {
                clearTimeout(resetTimerRef.current);
            }
        };
    }, []);

    const handleLogoPress = async () => {
        // Se já desbloqueou, não faz nada
        if (adminUnlocked) {
            console.log('🔒 Admin já desbloqueado');
            return;
        }

        const newCount = logoPress + 1;
        console.log(`👆 Toque ${newCount}/3`);
        setLogoPress(newCount);

        // Limpa o timer anterior
        if (resetTimerRef.current) {
            clearTimeout(resetTimerRef.current);
        }

        if (newCount >= 3) {
            setShowPasswordModal(true);
            setLogoPress(0);
            // try {
            //     const deviceId = await Application.getAndroidId();
            //     console.log('🔍 Verificando dispositivo:', deviceId);

            //     if (deviceId === ADMIN_DEVICE) {
            //         console.log('✅ Acesso autorizado! Desbloqueando admin...');
            //         setAdminUnlocked(true);
            //         Alert.alert('✅ Admin Desbloqueado', 'Botão de configurações ativado!');
            //     } else {
            //         console.log('❌ Dispositivo não autorizado');
            //         Alert.alert('Acesso Negado', 'Dispositivo não autorizado');
            //         setLogoPress(0);
            //     }
            // } catch (error) {
            //     console.error('❌ Erro ao verificar:', error);
            //     Alert.alert('Erro', 'Não foi possível verificar o dispositivo');
            //     setLogoPress(0);
            // }
        } else {
            // Reseta contador após 5 segundos
            resetTimerRef.current = setTimeout(() => {
                console.log('⏰ Timer expirou - resetando contador');
                setLogoPress(0);
            }, 5000);
        }
    };

    // Debug: monitora mudanças nos estados
    useEffect(() => {
        console.log('📊 Estado atual:', {
            // showAdminButton,
            adminUnlocked,
            logoPress,
            botaoVisivel: adminUnlocked
            // botaoVisivel: showAdminButton && adminUnlocked
        });
    }, [adminUnlocked, logoPress]);
    // }, [showAdminButton , adminUnlocked, logoPress]);

    return (
        <ScrollView style={styles.container}>
            {/* Header com Logo */}
            <TouchableOpacity
                onPress={handleLogoPress}
                disabled={adminUnlocked}
                activeOpacity={0.7}
            >
                <LinearGradient
                    colors={[COLORS.primary, COLORS.secondary]}
                    style={styles.header}
                >
                    <Text style={styles.title}>🐔 Toca do Frango</Text>
                    <Text style={styles.subtitle}>O melhor frango assado da cidade!</Text>
                </LinearGradient>
            </TouchableOpacity>

            {/* Botões de Ação Rápida */}
            <View style={styles.quickActions}>
                <TouchableOpacity
                    style={[styles.button, styles.menuButton]}
                    onPress={() => navigation.navigate('Menu')}
                >
                    <MaterialIcons name="restaurant-menu" size={24} color="white" />
                    <Text style={styles.buttonText}>Ver Cardápio</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.cartButton]}
                    onPress={() => navigation.navigate('Cart')}
                >
                    <MaterialIcons name="shopping-cart" size={24} color="white" />
                    <Text style={styles.buttonText}>Meu Pedido</Text>
                </TouchableOpacity>

                {/* {showAdminButton && adminUnlocked && ( */}
                {adminUnlocked && (
                    <TouchableOpacity
                        style={[styles.button, styles.adminButton]}
                        onPress={() => {
                            console.log('🚀 Navegando para Admin');
                            navigation.navigate('Admin');
                        }}
                    >
                        <MaterialIcons name="admin-panel-settings" size={24} color="white" />
                        <Text style={styles.buttonText}>Configurações</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Informações */}
            <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>⏰ Horário de Funcionamento</Text>
                <Text style={styles.infoText}>Sábado e Domingo: 10h às 15h</Text>

                <Text style={styles.sectionTitle}>📍 Localização</Text>
                <Text style={styles.infoText}>Rua da Consolação, 900</Text>
                <Text style={styles.infoText}>Emaús - Parnamirim/RN</Text>

                <Text style={styles.sectionTitle}>📞 Contato</Text>
                <Text style={styles.infoText}>(84) 98822-2025</Text>
            </View>
            <InputAlert
                visible={showPasswordModal}
                title="🔐 Acesso Admin"
                message="Digite o código de acesso:"
                placeholder="Código"
                secureTextEntry={true}
                confirmText="Entrar"
                cancelText="Cancelar"
                onConfirm={(code) => {
                    if (code === ADMIN_DEVICE) {
                        setAdminUnlocked(true);
                        Alert.alert('✅ Acesso autorizado!', 'Admin desbloqueado!');
                    } else {
                        Alert.alert('❌ Acesso negado!', 'Código incorreto!');
                    }
                    setShowPasswordModal(false);
                }}
                onCancel={() => setShowPasswordModal(false)}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        padding: 30,
        alignItems: 'center',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.background,
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.background,
        opacity: 0.9,
    },
    quickActions: {
        padding: 20,
        gap: 15,
    },
    button: {
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    menuButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 15
    },
    cartButton: {
        backgroundColor: COLORS.textSecondary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 15
    },
    adminButton: {
        backgroundColor: COLORS.admin,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 15
    },
    buttonText: {
        color: COLORS.background,
        fontSize: 18,
        fontWeight: 'bold',
    },
    infoSection: {
        padding: 20,
        backgroundColor: '#F5F5F5',
        margin: 20,
        borderRadius: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginTop: 15,
        marginBottom: 5,
    },
    infoText: {
        fontSize: 14,
        color: COLORS.text,
        marginBottom: 2,
    },
});