// src/screens/CartScreen.tsx

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Linking,
    Modal
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

import { COLORS } from '@/constants/colors';
import { useMenu } from '@/context/MenuContext';
import { useCart } from '@/context/CartContext';

export default function CartScreen({ route, navigation }: any) {
    const [showPaymentOptions, setShowPaymentOptions] = useState(false);
    const { cart, removeFromCart, updateQuantity } = useCart();
    const [customerInfo, setCustomerInfo] = useState({
        name: '',
        phone: '',
        address: ''
    });

    const { products } = useMenu();

    const getCartItems = () => {
        const items = [];
        for (const [productId, quantity] of Object.entries(cart || {})) {
            const product = products.find(p => p.id === productId);
            if (product && product.available) { // ← SÓ SE DISPONÍVEL
                items.push({
                    ...product,
                    quantity: quantity as number
                });
            }
        }
        return items;
    };

    const getTotal = () => {
        return getCartItems().reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const formatWhatsAppMessage = () => {
        const items = getCartItems();
        let message = `🐔 *TOCA DO FRANGO - NOTA FISCAL* 🐔\n\n`;

        message += `📋 *DADOS DO CLIENTE*\n`;
        message += `${'─'.repeat(35)}\n`;
        message += `👤 *Nome:* ${customerInfo.name}\n`;
        message += `📞 *Telefone:* ${customerInfo.phone}\n`;
        message += `📍 *Endereço:* ${customerInfo.address}\n\n`;

        message += `🛒 *PEDIDO*\n`;
        message += `${'─'.repeat(35)}\n`;

        items.forEach((item, index) => {
            message += `${index + 1}. *${item.name}*\n`;
            message += `   Qtde: ${item.quantity}x\n`;
            message += `   Unit.: R$ ${item.price.toFixed(2)}\n`;
            message += `   Subtotal: R$ ${(item.price * item.quantity).toFixed(2)}\n`;
            message += `\n`;
        });

        message += `${'═'.repeat(35)}\n`;
        message += `💰 *TOTAL DO PEDIDO: R$ ${getTotal().toFixed(2)}*\n\n`;

        message += `📅 *DATA/HORA:* ${new Date().toLocaleString('pt-BR')}*\n\n`;

        message += `🔔 *OBSERVAÇÕES*\n`;
        message += `- Pedido confirmado via app\n`;
        message += `- Prazo estimado: 40-60 min\n`;
        message += `- Formas de pagamento: dinheiro/pix\n\n`;

        message += `📱 *ENVIADO AUTOMATICAMENTE PELO APP*\n`;
        message += `${'═'.repeat(35)}`;

        return message;
    };

    const sendToWhatsApp = () => {
        if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
            Alert.alert('⚠️ Campos Obrigatórios', 'Por favor, preencha todos os seus dados!');
            return;
        }

        const message = formatWhatsAppMessage();
        const phoneNumber = '5584999397770'; // SEU NÚMERO DE WHATSAPP AQUI
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

        Alert.alert(
            '📱 Enviar Pedido',
            'Deseja enviar este pedido para o WhatsApp?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Enviar',
                    onPress: () => {
                        // Aqui você abriria o WhatsApp
                        Linking.openURL(whatsappUrl).catch(() => {
                            Alert.alert('❌ Erro', 'Não foi possível abrir o WhatsApp. Verifique se o app está instalado.');
                        })
                        // Para teste, vamos mostrar a mensagem
                        Alert.alert('📋 Mensagem Gerada:', message);
                    }
                }
            ]
        );
    };

    const cartItems = getCartItems();

    if (cartItems.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>🛒 Seu carrinho está vazio!</Text>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.navigate('Menu')}
                >
                    <Text style={styles.backButtonText}>Ver Cardápio</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView style={styles.scrollView}>
                <Text style={styles.title}>🛒 Meu Pedido</Text>

                {/* Itens do Carrinho */}
                <View style={styles.itemsSection}>
                    {cartItems.map((item, index) => (
                        <View key={index} style={styles.itemCard}>
                            <View style={styles.itemInfo}>
                                <Text style={styles.itemName}>{item.name}</Text>
                                <Text style={styles.itemDetails}>
                                    {item.quantity}x R$ {item.price.toFixed(2)} = R$ {(item.price * item.quantity).toFixed(2)}
                                </Text>
                            </View>

                            {/* CONTROLES DE QUANTIDADE */}
                            <View style={styles.quantityControls}>
                                <TouchableOpacity
                                    style={styles.quantityButton}
                                    onPress={() => updateQuantity(item.id, item.quantity - 1)}
                                >
                                    <Text style={styles.quantityButtonText}>-</Text>
                                </TouchableOpacity>

                                <Text style={styles.quantityText}>{item.quantity}</Text>

                                <TouchableOpacity
                                    style={styles.quantityButton}
                                    onPress={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                    <Text style={styles.quantityButtonText}>+</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.removeButton}
                                    onPress={() => removeFromCart(item.id)}
                                >
                                    <FontAwesome5 name="trash" size={16} color="#FF0000" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Total */}
                <View style={styles.totalSection}>
                    <FontAwesome5 name="money-bill-wave" size={24} color="white" />
                    <Text style={styles.totalText}>Total: R$ {getTotal().toFixed(2)}</Text>
                </View>

                {/* Formulário Cliente */}
                <View style={styles.formSection}>
                    <Text style={styles.sectionTitle}>👤 Seus Dados</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Nome completo:</Text>
                        <TextInput
                            style={styles.input}
                            value={customerInfo.name}
                            onChangeText={(text) => setCustomerInfo({ ...customerInfo, name: text })}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Telefone com DDD:</Text>
                        <TextInput
                            style={styles.input}
                            value={customerInfo.phone}
                            onChangeText={(text) => setCustomerInfo({ ...customerInfo, phone: text })}
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Forma de pagamento:</Text>
                        <TouchableOpacity
                            style={styles.paymentSelector}
                            onPress={() => setShowPaymentOptions(true)}
                        >
                            <Text style={styles.paymentText}>
                                {customerInfo.address || 'Selecione a forma de pagamento'}
                            </Text>
                            <FontAwesome5 name="chevron-down" size={16} color={COLORS.text} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Modal de seleção de pagamento */}
                <Modal
                    visible={showPaymentOptions}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowPaymentOptions(false)}
                >
                    <View style={styles.paymentModalOverlay}>
                        <View style={styles.paymentModalContent}>
                            <Text style={styles.paymentModalTitle}>Forma de Pagamento</Text>

                            {['Dinheiro', 'PIX', 'Cartão crédito/débito'].map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    style={styles.paymentOption}
                                    onPress={() => {
                                        setCustomerInfo({ ...customerInfo, address: option });
                                        setShowPaymentOptions(false);
                                    }}
                                >
                                    <Text style={styles.paymentOptionText}>{option}</Text>
                                </TouchableOpacity>
                            ))}

                            <TouchableOpacity
                                style={styles.paymentCancel}
                                onPress={() => setShowPaymentOptions(false)}
                            >
                                <Text style={styles.paymentCancelText}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* Botão Enviar */}
                <TouchableOpacity style={styles.sendButton} onPress={sendToWhatsApp}>
                    <FontAwesome5 name="whatsapp" size={24} color="white" />
                    <Text style={styles.sendButtonText}>Enviar para WhatsApp</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        // padding: 20,
    },
    scrollView: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 20,
        textAlign: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    emptyText: {
        fontSize: 20,
        color: COLORS.text,
        marginBottom: 20,
    },
    backButton: {
        backgroundColor: COLORS.primary,
        padding: 15,
        borderRadius: 10,
    },
    backButtonText: {
        color: COLORS.background,
        fontSize: 16,
        fontWeight: 'bold',
    },
    itemsSection: {
        marginBottom: 20,
    },
    itemCard: {
        backgroundColor: '#FFF',
        padding: 15,
        marginBottom: 10,
        borderRadius: 10,
        elevation: 2,
    },
    itemInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        flex: 1,
    },
    itemDetails: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    totalSection: {
        backgroundColor: COLORS.text,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 15,
        padding: 20,
        borderRadius: 10,
        marginBottom: 20,
    },
    totalText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.background,
    },
    formSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 15,
    },
    input: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        fontSize: 16,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    sendButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 15,
        padding: 20,
        borderRadius: 15,
        marginBottom: 40,
    },
    sendButtonText: {
        color: COLORS.background,
        fontSize: 18,
        fontWeight: 'bold',
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    quantityButton: {
        backgroundColor: COLORS.primary,
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    quantityText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        minWidth: 30,
        textAlign: 'center',
    },
    removeButton: {
        padding: 8,
        borderRadius: 5,
    },
    inputGroup: {
        marginBottom: 0,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 8,
    },
    paymentSelector: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 10,
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    paymentText: {
        fontSize: 16,
        color: COLORS.text,
    },
    paymentModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    paymentModalContent: {
        backgroundColor: '#FFF',
        borderRadius: 15,
        padding: 20,
        width: '80%',
        maxHeight: '50%',
    },
    paymentModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 20,
        textAlign: 'center',
    },
    paymentOption: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    paymentOptionText: {
        fontSize: 16,
        color: COLORS.text,
        textAlign: 'center',
    },
    paymentCancel: {
        padding: 15,
        marginTop: 10,
    },
    paymentCancelText: {
        fontSize: 16,
        color: COLORS.primary,
        textAlign: 'center',
        fontWeight: 'bold',
    },
});