// src/screens/PrivacyPolicyScreen.tsx

import React from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

export default function PrivacyPolicyScreen({ navigation }: any) {
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <FontAwesome5 name="arrow-left" size={18} color={COLORS.background} />
                    </TouchableOpacity>
                    <View style={styles.headerTitle}>
                        <Text style={styles.title}>Política de Privacidade</Text>
                    </View>
                </View>
            </View>

            {/* Content */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📋 Nossa Política de Privacidade</Text>
                    <Text style={styles.sectionDate}>Atualizada em: {new Date().toLocaleDateString('pt-BR')}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.subtitle}>1. Informações que Coletamos</Text>
                    <Text style={styles.text}>
                        Coletamos apenas informações necessárias para fornecer nossos serviços:
                    </Text>
                    <View style={styles.list}>
                        <Text style={styles.listItem}>• Nome e contato para delivery</Text>
                        <Text style={styles.listItem}>• Endereço de entrega</Text>
                        <Text style={styles.listItem}>• Histórico de pedidos</Text>
                        <Text style={styles.listItem}>• Informações de pagamento</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.subtitle}>2. Como Usamos Suas Informações</Text>
                    <Text style={styles.text}>
                        Suas informações são usadas exclusivamente para:
                    </Text>
                    <View style={styles.list}>
                        <Text style={styles.listItem}>• Processar e entregar seus pedidos</Text>
                        <Text style={styles.listItem}>• Melhorar nossos serviços</Text>
                        <Text style={styles.listItem}>• Comunicação sobre seu pedido</Text>
                        <Text style={styles.listItem}>• Suporte ao cliente</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.subtitle}>3. Armazenamento e Segurança</Text>
                    <Text style={styles.text}>
                        Seus dados são armazenados com segurança:
                    </Text>
                    <View style={styles.list}>
                        <Text style={styles.listItem}>• Criptografia em transmissão</Text>
                        <Text style={styles.listItem}>• Servidores seguros (Firebase)</Text>
                        <Text style={styles.listItem}>• Acesso restrito à equipe</Text>
                        <Text style={styles.listItem}>• Backup regular dos dados</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.subtitle}>4. Compartilhamento de Dados</Text>
                    <Text style={styles.text}>
                        Não vendemos ou compartilhamos seus dados com terceiros, exceto:
                    </Text>
                    <View style={styles.list}>
                        <Text style={styles.listItem}>• Parceiros de entrega (quando necessário)</Text>
                        <Text style={styles.listItem}>• Processadores de pagamento</Text>
                        <Text style={styles.listItem}>• Quando exigido por lei</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.subtitle}>5. Seus Direitos</Text>
                    <Text style={styles.text}>
                        Você tem direito a:
                    </Text>
                    <View style={styles.list}>
                        <Text style={styles.listItem}>• Acessar seus dados</Text>
                        <Text style={styles.listItem}>• Corrigir informações incorretas</Text>
                        <Text style={styles.listItem}>• Excluir sua conta</Text>
                        <Text style={styles.listItem}>• Exportar seus dados</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.subtitle}>6. Contato</Text>
                    <Text style={styles.text}>
                        Para dúvidas sobre privacidade, entre em contato:
                    </Text>
                    <View style={styles.contactInfo}>
                        <Text style={styles.contactItem}>📧 Email: privacidade@tocadofrango.com</Text>
                        <Text style={styles.contactItem}>📞 Telefone: (84) 98822-2025</Text>
                        <Text style={styles.contactItem}>📍 Rua da Consolação, 900</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.subtitle}>7. Tempo de Retenção</Text>
                    <Text style={styles.text}>
                        Nossos dados são armazenados pelo tempo necessário para:
                    </Text>
                    <View style={styles.list}>
                        <Text style={styles.listItem}>• Cardápio e produtos: enquanto ativos</Text>
                        <Text style={styles.listItem}>• Carrinho temporário: durante sessão</Text>
                        <Text style={styles.listItem}>• Configurações do sistema: enquanto necessário</Text>
                    </View>
                    <Text style={styles.text}>
                        Dados do cliente (nome, telefone, endereço) são usados apenas no momento do pedido e não armazenados permanentemente.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.subtitle}>8. Tempo de Retenção</Text>
                    <Text style={styles.text}>
                        Seus dados são armazenados pelo tempo necessário para:
                    </Text>
                    <View style={styles.list}>
                        <Text style={styles.listItem}>• Processar pedidos (até 30 dias após entrega)</Text>
                        <Text style={styles.listItem}>• Manutenção de histórico (2 anos)</Text>
                        <Text style={styles.listItem}>• Obrigações legais (conforme determinação)</Text>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Esta política pode ser atualizada. Continuaremos informando sobre quaisquer mudanças.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        backgroundColor: COLORS.privacy,
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    backButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
        padding: 8,
        marginRight: 15,
    },
    headerTitle: {
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.background,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    section: {
        marginBottom: 25,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 8,
    },
    sectionDate: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginBottom: 15,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 10,
    },
    text: {
        fontSize: 14,
        color: COLORS.text,
        lineHeight: 20,
        marginBottom: 10,
    },
    list: {
        marginLeft: 10,
        marginBottom: 10,
    },
    listItem: {
        fontSize: 14,
        color: COLORS.text,
        lineHeight: 20,
        marginBottom: 5,
    },
    contactInfo: {
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        padding: 15,
        marginTop: 10,
    },
    contactItem: {
        fontSize: 14,
        color: COLORS.text,
        marginBottom: 8,
    },
    footer: {
        marginTop: 20,
        marginBottom: 40,
        padding: 20,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
    },
    footerText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        textAlign: 'center',
        fontStyle: 'italic',
    },
});