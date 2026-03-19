// src/screens/CartScreen.tsx

import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
    KeyboardAvoidingView,
    Platform,
    Linking,
    Pressable,
    Modal
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

import { COLORS } from '@/constants/colors';
import { useMenu } from '@/context/MenuContext';
import { useCart } from '@/context/CartContext';
import { adminNumber } from '@/utils/whatsapp';
import CustomAlert from '@/components/CustomAlert';
import { deliveryService, DeliveryZone } from '@/services/deliveryService';

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
    const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
    const [showZoneSelector, setShowZoneSelector] = useState(false);

    const {
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        deliveryType,
        setDeliveryType,
        getDeliveryFee,
        clearCart,
        decreaseStock,
        checkStockAvailability,
        selectedDeliveryZone,
        setSelectedDeliveryZone,
        selectedDeliveryZoneId,
        setSelectedDeliveryZoneId
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

    // ✅ FIX 1: useCallback retorna uma função estável e reutilizável
    const getCartItems = useCallback(() => {
        return Object.entries(cart || {})
            .map(([productId, quantity]) => {
                const product = products.find(p => p.id === productId);
                if (product && product.available) {
                    return { ...product, quantity: quantity as number };
                }
                return null;
            })
            .filter(Boolean) as (typeof products[0] & { quantity: number })[];
    }, [cart, products]);

    // ✅ FIX 2: cartItems é o valor memoizado — usado em todo o componente
    const cartItems = useMemo(() => getCartItems(), [getCartItems]);

    // ✅ FIX 3: side effect de alerta separado em useEffect
    useEffect(() => {
        const unavailableItems = Object.entries(cart || {})
            .map(([productId]) => products.find(p => p.id === productId))
            .filter(product => product && !product.available)
            .map(product => product!.name);

        if (unavailableItems.length > 0) {
            showAlert(
                '⚠️ Produtos Indisponíveis',
                `Os seguintes produtos estão sem estoque no momento:\n${unavailableItems.join(', ')}`,
                () => { },
                'OK'
            );
        }
    }, [cart, products]);

    // ✅ FIX 4: getTotal usa cartItems (valor), não getCartItems() (chamada)
    const getTotal = useMemo(() => {
        const itemsTotal = cartItems.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        );
        return itemsTotal + getDeliveryFee();
    }, [cartItems, deliveryType, selectedDeliveryZone]);

    const loadDeliveryZones = async () => {
        try {
            const zones = await deliveryService.getActiveDeliveryZones();
            setDeliveryZones(zones);
        } catch (error) {
            console.error('Erro ao carregar zonas:', error);
        }
    };

    const handleRemoveFromCart = (productId: string, productName: string) => {
        showAlert(
            'Remover do Carrinho',
            `Tem certeza que deseja remover "${productName}" do carrinho?`,
            () => { removeFromCart(productId); },
            'Remover',
            () => { },
            'Cancelar'
        );
    };

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
        // ✅ FIX 5: usa cartItems (valor) em vez de getCartItems()
        let message = `🐔 *TOCA DO FRANGO - PEDIDO CONFIRMADO* 🐔`;
        message += `\n👤 *Cliente:* ${customerInfo.name}`;
        message += `\n📞 *Tel:* ${customerInfo.phone}`;
        message += `\n🏍️ *Entrega:* ${deliveryType === 'retirada'
            ? 'Retirada no local'
            : `Delivery - ${selectedDeliveryZone?.name || 'Selecione um bairro'} (+R$ ${getDeliveryFee().toFixed(2)})`
            }`;

        if (deliveryType === 'entrega') {
            message += `\n📍 *Endereço:* ${customerInfo.address}`;
        }
        message += `\n💳 *Pagamento:* ${customerInfo.paymentMethod}`;
        message += `\n📋 *PEDIDO*\n`;
        message += `${'─'.repeat(20)}`;

        cartItems.forEach((item, index) => {
            message += `\n${index + 1}. ${item.name} - ${item.quantity}x = R$ ${(item.price * item.quantity).toFixed(2)}\n`;
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
            // ✅ FIX 6: usa cartItems (valor) em vez de getCartItems()
            const stockCheck = await checkStockAvailability(cartItems);

            if (!stockCheck.available) {
                showAlert(
                    'Estoque Insuficiente',
                    stockCheck.message || 'Estoque insuficiente para alguns itens',
                    () => { },
                    'OK'
                );
                setLoading(false);
                return;
            }

            if (
                !customerInfo.name ||
                !customerInfo.phone ||
                !customerInfo.paymentMethod ||
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

            const message = formatWhatsAppMessage();
            const phoneNumber = await adminNumber();
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

            showAlert(
                '📱 Enviar Pedido',
                'Deseja enviar este pedido para o WhatsApp?',
                async () => {
                    try {
                        await Linking.openURL(whatsappUrl);

                        // ✅ FIX 7: usa cartItems (valor) em vez de getCartItems()
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
                () => { },
                'CANCELAR'
            );

        } catch (error) {
            console.error('Erro ao enviar pedido:', error);
            showAlert('Erro', 'Não foi possível enviar o pedido', () => { }, 'OK');
        } finally {
            setLoading(false);
        }
    };

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
    };

    useEffect(() => {
        loadDeliveryZones();
    }, []);

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
            // behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            behavior='padding'
            keyboardVerticalOffset={Platform.OS === 'android' ? 5 : 0}
            style={styles.container}
        >
            <ScrollView
                style={styles.scrollView}
                keyboardShouldPersistTaps='handled'
                showsVerticalScrollIndicator={false}
            >
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

                            <View style={styles.quantityControls}>
                                <TouchableOpacity
                                    style={styles.quantityButton}
                                    onPress={() =>
                                        item.quantity > 1
                                            ? updateQuantity(item.id, item.quantity - 1, products)
                                            : handleRemoveFromCart(item.id, item.name)
                                    }
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
                            autoCapitalize="words"
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
                            placeholder="(00) 00000-0000"
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
                                {deliveryType === 'retirada'
                                    ? '🏃 Retirada no local'
                                    : `🏍️ Delivery - ${selectedDeliveryZone?.name || 'Selecione um bairro'} (+R$${getDeliveryFee().toFixed(2)})`}
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
                    <Pressable
                        style={styles.paymentModalOverlay}
                        onPress={() => { setShowPaymentOptions(false) }}
                    >
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
                    </Pressable>
                </Modal>

                {/* Modal de seleção de entrega */}
                <Modal
                    visible={showDeliveryOptions}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowDeliveryOptions(false)}
                >
                    <Pressable
                        style={styles.paymentModalOverlay}
                        onPress={() => { 
                            setShowDeliveryOptions(false);
                         }}
                    >
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
                                    setShowDeliveryOptions(false);
                                    setShowZoneSelector(true);
                                }}
                            >
                                <Text style={styles.paymentOptionText}>🏍️ Delivery</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.paymentCancel}
                                onPress={() => setShowDeliveryOptions(false)}
                            >
                                <Text style={styles.paymentCancelText}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Modal>

                {/* Modal de seleção de zona de entrega */}
                <Modal
                    visible={showZoneSelector}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowZoneSelector(false)}
                >
                    <Pressable
                        style={styles.paymentModalOverlay}
                        onPress={() => {
                            setShowZoneSelector(false);
                            setShowDeliveryOptions(true)
                        }}
                    >
                        <View style={styles.paymentModalContent}>
                            <Text style={styles.paymentModalTitle}>📍 Selecione seu Bairro</Text>

                            <ScrollView style={{ maxHeight: 300 }}>
                                {deliveryZones.map((zone) => (
                                    <TouchableOpacity
                                        key={zone.id}
                                        style={[
                                            styles.paymentOption,
                                            selectedDeliveryZone?.id === zone.id && styles.selectedOption
                                        ]}
                                        onPress={() => {
                                            setSelectedDeliveryZone(zone);
                                            setSelectedDeliveryZoneId(zone.id || null);
                                            setDeliveryType('entrega');
                                            setShowZoneSelector(false);
                                        }}
                                    >
                                        <Text style={styles.paymentOptionText}>{zone.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <TouchableOpacity
                                style={styles.paymentCancel}
                                onPress={() => setShowZoneSelector(false)}
                            >
                                <Text style={styles.paymentCancelText}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
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
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
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
    selectedOption: {
        backgroundColor: COLORS.selectOption,
        borderWidth: 2,
        borderColor: COLORS.selectOption,
    },
});