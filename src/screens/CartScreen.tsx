// src/screens/CartScreen.tsx

import React, { useState, useMemo } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { APP_CONFIG } from '@/config/app';
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
import { adminNumber } from '@/utils/whatsapp';
import CustomAlert from '@/components/CustomAlert';

interface AlertConfig {
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText: string;
    onCancel?: () => void;
    cancelText?: string;
}

export default function CartScreen({ navigation }: any) {
    const [showPaymentOptions, setShowPaymentOptions] = useState(false);
    const [showDeliveryOptions, setShowDeliveryOptions] = useState(false);

    const { cart,
        removeFromCart,
        updateQuantity,
        deliveryType,
        setDeliveryType,
        getDeliveryFee,
        clearCart,
        decreaseStock,
        checkStockAvailability,
    } = useCart();
    const [loading, setLoading] = useState(false);
    const [customerInfo, setCustomerInfo] = useState({
        name: '',
        phone: '',
        paymentMethod: '',
        address: ''
    });

    const [alertConfig, setAlertConfig] = useState<AlertConfig>({
        title: '',
        message: '',
        onConfirm: () => { },
        confirmText: 'Confirmar',
    });
    const [alertVisible, setAlertVisible] = useState(false);

    const { products } = useMenu();

    const getCartItems = () => {
        const items = [];
        const unavailableItems = [];

        for (const [productId, quantity] of Object.entries(cart || {})) {
            const product = products.find(p => p.id === productId);
            if (product && product.available) { // ← SÓ SE DISPONÍVEL
                items.push({
                    ...product,
                    quantity: quantity as number
                });
            } else if (product) {
                unavailableItems.push(product.name);
            }
        }

        if (unavailableItems.length > 0) {
            showAlert(
                '⚠️ Produtos Indisponíveis',
                `Os seguintes produtos estão sem estoque no momento:\n
                ${unavailableItems.join('')}`,
                () => { },
                'OK'
            );
        }
        return items;
    };

    const handleRemoveFromCart = (productId: string, productName: string) => {
        showAlert(
            'Remover do Carrinho',
            `Tem certeza que deseja remover "${productName}" do carrinho?`,
            () => {
                removeFromCart(productId);
            },
            'Remover',
            () => { },
            'Cancelar'
        );
    }

    const showAlert = (
        title: string,
        message: string,
        onConfirm: () => void,
        confirmText: string,
        onCancel?: () => void,
        cancelText?: string,
    ) => {
        setAlertConfig({
            title,
            message,
            onConfirm: () => {
                onConfirm();
                setAlertVisible(false);
            },
            confirmText,
            onCancel: onCancel ? () => {
                onCancel();
                setAlertVisible(false);
            } : undefined,
            cancelText,
        });
        setAlertVisible(true);
    };

    const formatWhatsAppMessage = () => {
        const items = getCartItems();

        let message = `🐔 *TOCA DO FRANGO - PEDIDO CONFIRMADO* 🐔`;
        message += `\n👤 *Cliente:* ${customerInfo.name}`;
        message += `\n📞 *Tel:* ${customerInfo.phone}`;
        message += `\n🏍️ *Entrega:* ${deliveryType === 'retirada' ? 'Retirada no local' : `Delivery (+R$ ${APP_CONFIG.DELIVERY_FEE.toFixed(2)})`}`;
        if (deliveryType === 'entrega') {
            message += `\n📍 *Endereço:* ${customerInfo.address}`;
        }
        message += `\n💳 *Pagamento:* ${customerInfo.paymentMethod}`;

        message += `\n📋 *PEDIDO*\n`;
        message += `${'─'.repeat(20)}`;

        items.forEach((item, index) => {
            message += `\n${index + 1}. ${item.name} - ${item.quantity}x = R$ ${(item.price * item.quantity).toFixed(2)}
`;
        });

        if (getDeliveryFee() > 0) {
            message += `\n🏍️ *Taxa de entrega:* R$ ${getDeliveryFee().toFixed(2)}\n`;
        }

        message += `${'═'.repeat(20)}`;
        message += `\n💰 *TOTAL: R$ ${getTotal.toFixed(2)}*`;
        message += `\n⏱️ *Prazo:* 40-60 min`;
        message += `\n📱 *Enviado pelo App*`;

        return message;
    };

    const validatePhone = (phone: string): boolean => {
        const phoneRegex = /^\d{10,11}$/;
        const cleanedPhone = phone.replace(/\D/g, '');
        return phoneRegex.test(cleanedPhone);
    };

    const sendToWhatsApp = async () => {
        setLoading(true);

        try {
            // Verificar estoque ANTES de enviar
            const stockCheck = await checkStockAvailability(cartItems);

            if (!stockCheck.available) {
                showAlert(
                    'Estoque Insuficiente',
                    stockCheck.message || 'Estoque insuficiente para alguns itens',
                    () => { }, 'OK');
                setLoading(false);
                return;
            }

            // Validações dos dados do cliente
            if (!customerInfo.name || !customerInfo.phone || !customerInfo.paymentMethod ||
                (deliveryType === 'entrega' && !customerInfo.address)
            ) {
                showAlert(
                    '⚠️ Campos Obrigatórios',
                    'Por favor, preencha todos os seus dados!',
                    () => { },
                    'OK'
                );
                setLoading(false);
                return;
            }

            if (!validatePhone(customerInfo.phone)) {
                showAlert(
                    '⚠️ Telefone Inválido',
                    'Por favor, digite um número de DDD + telefone válido!',
                    () => { },
                    'OK'
                );
                setLoading(false);
                return;
            }

            // ✅ AGORA SIM - MOSTRA CONFIRMAÇÃO ANTES DE ENVIAR
            const message = formatWhatsAppMessage();
            const phoneNumber = await adminNumber();
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

            showAlert(
                '📱 Enviar Pedido',
                'Deseja enviar este pedido para o WhatsApp?',
                async () => {
                    // SÓ EXECUTA SE CLICAR "ENVIAR"
                    try {
                        await Linking.openURL(whatsappUrl);

                        // Diminui estoque
                        for (const item of cartItems) {
                            if (item.hasStockControl) {
                                await decreaseStock(item.id, products, item.quantity);
                            }
                        }

                        clearCart();
                        setCustomerInfo({
                            name: '',
                            phone: '',
                            paymentMethod: '',
                            address: ''
                        });
                        setDeliveryType('retirada');
                    } catch (error) {
                        showAlert(
                            '❌ Erro',
                            'Não foi possível abrir o WhatsApp. Verifique se o app está instalado.',
                            () => { },
                            'OK'
                        );
                    }
                },
                'ENVIAR',
                () => { }, // onCancel - apenas fecha
                'CANCELAR'
            );

        } catch (error) {
            console.error('Erro ao enviar pedido:', error);
            showAlert('Erro', 'Não foi possível enviar o pedido', () => { }, 'OK');
        } finally {
            setLoading(false);
        }
    };

    const cartItems = useMemo(() => getCartItems(), [cart, products]);

    const getTotal = useMemo(() => {
        const itemsTotal = getCartItems().reduce((total, item) => total + (item.price * item.quantity), 0);
        return itemsTotal + getDeliveryFee();
    }, [cartItems, deliveryType]);

    const formatPhone = (text: string) => {
        const cleaned = text.replace(/\D/g, '');
        const limited = cleaned.slice(0, 11);

        if (limited.length <= 2) {
            return limited;
        } else if (limited.length <= 7) {
            return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
        } else {
            return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
        }
    }

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
                                    onPress={() => updateQuantity(item.id, item.quantity - 1, products)}
                                >
                                    <Text style={styles.quantityButtonText}>-</Text>
                                </TouchableOpacity>

                                <Text style={styles.quantityText}>{item.quantity}</Text>

                                <TouchableOpacity
                                    style={styles.quantityButton}
                                    onPress={() => updateQuantity(item.id, item.quantity + 1, products)}
                                >
                                    <Text style={styles.quantityButtonText}>+</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.removeButton}
                                    onPress={() => handleRemoveFromCart(item.id, item.name)}
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
                    <Text style={styles.totalText}>Total: R$ {getTotal.toFixed(2)}</Text>
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
                            autoCapitalize='words'
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Telefone com DDD:</Text>
                        <TextInput
                            style={styles.input}
                            value={customerInfo.phone}
                            onChangeText={(text) => {
                                const formatted = formatPhone(text);
                                setCustomerInfo({ ...customerInfo, phone: formatted });
                            }}
                            placeholder='(00) 00000-0000'
                            keyboardType="phone-pad"
                            maxLength={15}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Forma de pagamento:</Text>
                        <TouchableOpacity
                            style={styles.paymentSelector}
                            onPress={() => setShowPaymentOptions(true)}
                        >
                            <Text style={styles.paymentText}>
                                {customerInfo.paymentMethod || 'Selecione a forma de pagamento'}
                            </Text>
                            <FontAwesome5 name="chevron-down" size={16} color={COLORS.text} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Tipo de entrega:</Text>
                        <TouchableOpacity
                            style={styles.deliverySelector}
                            onPress={() => setShowDeliveryOptions(true)}
                        >
                            <Text style={styles.deliveryText}>
                                {deliveryType === 'retirada' ? '🏃 Retirada no local' : '🏍️ Delivery (+R$3,00)'}
                            </Text>
                            <FontAwesome5 name="chevron-down" size={16} color={COLORS.text} />
                        </TouchableOpacity>
                    </View>
                    {deliveryType === 'entrega' && (
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Endereço de entrega:</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={customerInfo.address}
                                onChangeText={(text) => setCustomerInfo({ ...customerInfo, address: text })}
                                placeholder="Rua, número, bairro, complemento..."
                                multiline
                            />
                        </View>
                    )}

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
                                        setCustomerInfo({ ...customerInfo, paymentMethod: option });
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

                {/* Modal de seleção de entrega */}
                <Modal
                    visible={showDeliveryOptions}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowDeliveryOptions(false)}
                >
                    <View style={styles.paymentModalOverlay}>
                        <View style={styles.paymentModalContent}>
                            <Text style={styles.paymentModalTitle}>Tipo de Entrega</Text>

                            <TouchableOpacity
                                style={styles.paymentOption}
                                onPress={() => {
                                    setDeliveryType('retirada');
                                    setShowDeliveryOptions(false);
                                }}
                            >
                                <Text style={styles.paymentOptionText}>🏃 Retirada no local (Grátis)</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.paymentOption}
                                onPress={() => {
                                    setDeliveryType('entrega');
                                    setShowDeliveryOptions(false);
                                }}
                            >
                                <Text style={styles.paymentOptionText}>🏍️ Delivery (+R${APP_CONFIG.DELIVERY_FEE.toFixed(2)})</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.paymentCancel}
                                onPress={() => setShowDeliveryOptions(false)}
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
            <CustomAlert
                visible={alertVisible}
                title={alertConfig.title}
                message={alertConfig.message}
                onConfirm={alertConfig.onConfirm}
                confirmText={alertConfig.confirmText}
                onCancel={() => setAlertVisible(false)}
                cancelText={alertConfig.cancelText}
            />
        </KeyboardAvoidingView >
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
    deliverySelector: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 10,
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    deliveryText: {
        fontSize: 16,
        color: COLORS.text,
    },
});
