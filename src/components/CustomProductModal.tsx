// src/components/CustomProductModal.tsx

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    StyleSheet,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { Product, Category } from '@/types';

interface CustomProductModalProps {
    visible: boolean;
    product: Product | null;
    onSave: (product: Product) => void;
    onCancel: () => void;
    categories: Category[];
    onCategorySelect: () => void;
    selectedCategoryId: string;
}

export default function CustomProductModal({
    visible,
    product,
    onSave,
    onCancel,
    categories,
    onCategorySelect,
    selectedCategoryId,
}: CustomProductModalProps) {
    const [formData, setFormData] = useState({
        name: product?.name || '',
        description: product?.description || '',
        price: product?.price?.toFixed(2).replace('.', ',') || '',
        categoryId: product?.categoryId || product?.category || '',
        hasStockControl: product?.hasStockControl || false,
        stock: product?.stock?.toString() || '0',
    });

    const isEditing = !!product;

    const formatPrice = (value: string): string => {
        const numbers = value.replace(/\D/g, '');
        const cents = parseInt(numbers) || 0;
        return (cents / 100).toFixed(2).replace('.', ',');
    };

    const handleSave = () => {
        if (!formData.name.trim()) {
            Alert.alert('Erro', 'Digite o nome do produto');
            return;
        }

        const newProduct: Product = {
            id: product?.id || Date.now().toString(),
            name: formData.name.trim(),
            description: formData.description.trim(),
            price: parseFloat(formData.price.replace(',', '.')) || 0,
            categoryId: selectedCategoryId,
            hasStockControl: formData.hasStockControl,
            stock: formData.hasStockControl ? (parseInt(formData.stock) || 0) : 0,
            available: product?.available ?? true,
        };

        onSave(newProduct);
    };

    useEffect(() => {
        setFormData({
            name: product?.name || '',
            description: product?.description || '',
            price: product?.price?.toFixed(2).replace('.', ',') || '',
            categoryId: product?.categoryId || product?.category || '',
            hasStockControl: product?.hasStockControl || false,
            stock: product?.stock?.toString() || '0',
        });
    }, [product]);

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onCancel}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalOverlay}
            >
                <View style={styles.modalContent}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={styles.modalTitle}>
                            {isEditing ? 'Editar Produto' : 'Novo Produto'}
                        </Text>

                        {/* Campo Nome */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>
                                <FontAwesome5 name="tag" size={14} color={COLORS.primary} /> Nome do Produto
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Digite o nome do produto"
                                value={formData.name}
                                onChangeText={(text) => setFormData({ ...formData, name: text })}
                            />
                        </View>

                        {/* Campo Descrição */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>
                                <FontAwesome5 name="align-left" size={14} color={COLORS.primary} /> Descrição
                            </Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Descreva seu produto..."
                                value={formData.description}
                                onChangeText={(text) => setFormData({ ...formData, description: text })}
                                multiline
                            />
                        </View>

                        {/* Campo Preço */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>
                                <FontAwesome5 name="money-bill-wave" size={14} color={COLORS.primary} /> Preço
                            </Text>
                            <View style={styles.priceContainer}>
                                <Text style={styles.pricePrefix}>R$</Text>
                                <TextInput
                                    style={styles.priceInput}
                                    placeholder="0,00"
                                    placeholderTextColor="#999"
                                    value={formData.price}
                                    onChangeText={(text) => setFormData({ ...formData, price: formatPrice(text) })}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        {/* Campo Categoria */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>
                                <FontAwesome5 name="folder" size={14} color={COLORS.primary} /> Categoria
                            </Text>
                            <TouchableOpacity
                                style={styles.categorySelector}
                                onPress={onCategorySelect}
                            >
                                <Text style={[
                                    styles.categorySelectorText,
                                    !selectedCategoryId && { color: '#999' }
                                ]}>
                                    {categories.find(c => c.id === selectedCategoryId)?.name || 'Selecione uma categoria'}
                                </Text>
                                <FontAwesome5 name="chevron-down" size={14} color={COLORS.primary} />
                            </TouchableOpacity>
                        </View>

                        {/* Controle de Estoque */}
                        <View style={styles.inputGroup}>
                            <View style={styles.checkboxContainer}>
                                <TouchableOpacity
                                    style={styles.checkbox}
                                    onPress={() => setFormData({ ...formData, hasStockControl: !formData.hasStockControl })}
                                >
                                    <FontAwesome5
                                        name={formData.hasStockControl ? "check-square" : "square"}
                                        size={20}
                                        color={COLORS.primary}
                                    />
                                </TouchableOpacity>
                                <Text style={styles.checkboxLabel}>
                                    <FontAwesome5 name="box" size={14} color={COLORS.primary} /> Controlar Estoque
                                </Text>
                            </View>
                        </View>

                        {formData.hasStockControl && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>
                                    <FontAwesome5 name="boxes" size={14} color={COLORS.primary} /> Quantidade em Estoque
                                </Text>
                                <View style={styles.stockInputContainer}>
                                    <TouchableOpacity
                                        style={styles.stockButton}
                                        onPress={() => {
                                            const currentStock = parseInt(formData.stock) || 0;
                                            if (currentStock > 0) {
                                                setFormData({ ...formData, stock: (currentStock - 1).toString() });
                                            }
                                        }}
                                    >
                                        <FontAwesome5 name="minus" size={16} color={COLORS.primary} />
                                    </TouchableOpacity>
                                    <TextInput
                                        style={[styles.input, styles.stockInput]}
                                        placeholder="0"
                                        value={formData.stock}
                                        onChangeText={(text) => setFormData({ ...formData, stock: text.replace(/\D/g, '') })}
                                        keyboardType="numeric"
                                        maxLength={4}
                                    />
                                    <TouchableOpacity
                                        style={styles.stockButton}
                                        onPress={() => {
                                            const currentStock = parseInt(formData.stock) || 0;
                                            setFormData({ ...formData, stock: (currentStock + 1).toString() });
                                        }}
                                    >
                                        <FontAwesome5 name="plus" size={16} color={COLORS.primary} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={onCancel}
                            >
                                <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton]}
                                onPress={handleSave}
                            >
                                <Text style={styles.modalButtonTextConfirm}>Salvar</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: COLORS.background,
        padding: 20,
        borderRadius: 15,
        width: '90%',
        maxWidth: 400,
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 20,
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 15,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    categorySelector: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    categorySelectorText: {
        fontSize: 16,
        color: COLORS.text,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        marginRight: 10,
    },
    checkboxLabel: {
        fontSize: 16,
        color: COLORS.text,
    },
    stockInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    stockInput: {
        flex: 1,
        textAlign: 'center',
    },
    stockButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
        marginTop: 20,
    },
    modalButton: {
        flex: 1,
        padding: 15,
        borderRadius: 8,
    },
    cancelButton: {
        backgroundColor: '#ccc',
    },
    saveButton: {
        backgroundColor: COLORS.primary,
    },
    modalButtonTextCancel: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalButtonTextConfirm: {
        color: COLORS.background,
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        // borderWidth: 1,
        // borderColor: '#ddd',
        // borderRadius: 8,
        padding: 12,
    },
    pricePrefix: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginRight: 8
    },
    priceInput: {
        flex: 1,
        fontSize: 42,
        fontWeight: 'bold',
        color: COLORS.text,
    },
});