// src/screens/TermsOfServiceScreen.tsx

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

export default function TermsOfServiceScreen({ navigation }: any) {
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
                        <Text style={styles.title}>Termos de Serviço</Text>
                    </View>
                </View>
            </View>

            {/* Content */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📋 Termos de Serviço</Text>
                    <Text style={styles.sectionDate}>Atualizado em: {new Date().toLocaleDateString('pt-BR')}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.subtitle}>1. Aceitação dos Termos</Text>
                    <Text style={styles.text}>
                        Ao usar o aplicativo Toca do Frango, você concorda com estes termos de serviço.
                    </Text>
                    <Text style={styles.text}>
                        Se não concordar, não utilize nosso aplicativo ou serviços.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.subtitle}>2. Descrição do Serviço</Text>
                    <Text style={styles.text}>
                        O Toca do Frango é um aplicativo de delivery de alimentos que permite:
                    </Text>
                    <View style={styles.list}>
                        <Text style={styles.listItem}>• Visualizar nosso cardápio</Text>
                        <Text style={styles.listItem}>• Fazer pedidos online</Text>
                        <Text style={styles.listItem}>• Receber entregas em domicílio</Text>
                        <Text style={styles.listItem}>• Acompanhar status do pedido</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.subtitle}>3. Responsabilidades do Usuário</Text>
                    <Text style={styles.text}>
                        Ao usar nosso serviço, você se compromete a:
                    </Text>
                    <View style={styles.list}>
                        <Text style={styles.listItem}>• Fornecer informações verdadeiras</Text>
                        <Text style={styles.listItem}>• Manter dados atualizados</Text>
                        <Text style={styles.listItem}>• Usar o aplicativo de forma adequada</Text>
                        <Text style={styles.listItem}>• Respeitar nossos funcionários</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.subtitle}>4. Pedidos e Pagamentos</Text>
                    <Text style={styles.text}>
                        Sobre pedidos e pagamentos:
                    </Text>
                    <View style={styles.list}>
                        <Text style={styles.listItem}>• Preços estão sujeitos a alteração</Text>
                        <Text style={styles.listItem}>• Pagamentos devem ser confirmados</Text>
                        <Text style={styles.listItem}>• Taxas de entrega podem aplicar</Text>
                        <Text style={styles.listItem}>• Cancelamentos seguem nossa política</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.subtitle}>5. Entregas</Text>
                    <Text style={styles.text}>
                        Nossas entregas seguem estas diretrizes:
                    </Text>
                    <View style={styles.list}>
                        <Text style={styles.listItem}>• Tempos estimados podem variar</Text>
                        <Text style={styles.listItem}>• Endereço deve estar correto</Text>
                        <Text style={styles.listItem}>• Alguém deve estar no local</Text>
                        <Text style={styles.listItem}>• Não nos responsabilizamos por itens deixados na porta</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.subtitle}>6. Cancelamentos e Reembolsos</Text>
                    <Text style={styles.text}>
                        Política de cancelamento:
                    </Text>
                    <View style={styles.list}>
                        <Text style={styles.listItem}>• Cancelamento antes da preparação: reembolso integral</Text>
                        <Text style={styles.listItem}>• Cancelamento durante preparação: 50% de reembolso</Text>
                        <Text style={styles.listItem}>• Cancelamento após envio: sem reembolso</Text>
                        <Text style={styles.listItem}>• Reembolsos em até 7 dias úteis</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.subtitle}>7. Propriedade Intelectual</Text>
                    <Text style={styles.text}>
                        Todo conteúdo do aplicativo (logos, textos, imagens) é propriedade do Toca do Frango.
                    </Text>
                    <Text style={styles.text}>
                        É proibida cópia, reprodução ou uso não autorizado.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.subtitle}>8. Limitação de Responsabilidade</Text>
                    <Text style={styles.text}>
                        Não nos responsabilizamos por:
                    </Text>
                    <View style={styles.list}>
                        <Text style={styles.listItem}>• Interrupções temporárias do serviço</Text>
                        <Text style={styles.listItem}>• Problemas de conectividade</Text>
                        <Text style={styles.listItem}>• Atrasos devido a fatores externos</Text>
                        <Text style={styles.listItem}>• Uso indevido por parte do usuário</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.subtitle}>9. Contato e Suporte</Text>
                    <Text style={styles.text}>
                        Para dúvidas sobre estes termos:
                    </Text>
                    <View style={styles.contactInfo}>
                        <Text style={styles.contactItem}>📧 Email: suporte@tocadofrango.com</Text>
                        <Text style={styles.contactItem}>📞 Telefone: (84) 98822-2025</Text>
                        <Text style={styles.contactItem}>📍 Rua da Consolação, 900</Text>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Estes termos podem ser atualizados. O uso continuado do aplicativo após alterações indica aceitação.
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
        backgroundColor: COLORS.terms,
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
        color: COLORS.terms,
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