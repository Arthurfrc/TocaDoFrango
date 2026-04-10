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
    Image,
    Platform,
    Alert,
    ActivityIndicator
} from 'react-native';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { Product, Category } from '@/types';
import * as ImagePicker from 'expo-image-picker';
import { imageService } from '@/services/imageService';

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

    const [selectedImage, setSelectedImage] = useState<string | null>(
        product?.image || null
    );
    const [uploadingImage, setUploadingImage] = useState(false);

    const isEditing = !!product;

    const formatPrice = (value: string): string => {
        const numbers = value.replace(/\D/g, '');
        const cents = parseInt(numbers) || 0;
        return (cents / 100).toFixed(2).replace('.', ',');
    };

    const selectImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.7,
        });

        if (!result.canceled && result.assets[0]) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            Alert.alert('Erro', 'Digite o nome do produto');
            return;
        }

        try {
            let imageUrl: string | undefined = product?.image;

            // Se há nova imagem selecionada
            if (selectedImage && selectedImage !== product?.image) {
                setUploadingImage(true);
                const productId = product?.id || Date.now().toString();
                imageUrl = await imageService.uploadImage(productId, selectedImage);
            }

            // SE REMOVEU A IMAGEM (selectedImage é null mas product.image existia)
            if (!selectedImage && product?.image) {
                imageUrl = undefined; // REMOVE A IMAGEM
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
                ...(imageUrl && { image: imageUrl }),
            };

            onSave(newProduct);

            // Limpar formulário após salvar
            setFormData({
                name: '',
                description: '',
                price: '',
                categoryId: '',
                hasStockControl: false,
                stock: '0',
            });
            setSelectedImage(null);
        } catch (error) {
            setUploadingImage(false);
            Alert.alert('Erro', 'Não foi possível salvar a imagem');
        } finally {
            setUploadingImage(false);
        }
    };

    useEffect(() => {
        if (visible) {
            setFormData({
                name: product?.name || '',
                description: product?.description || '',
                price: product?.price?.toFixed(2).replace('.', ',') || '',
                categoryId: product?.categoryId || product?.category || '',
                hasStockControl: product?.hasStockControl || false,
                stock: product?.stock?.toString() || '0',
            });
            setSelectedImage(product?.image || null);
        }
    }, [product, visible]);

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

                        {/* Campo Imagem */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>
                                <FontAwesome5 name="image" size={14} color={COLORS.primary} /> Foto do Produto
                            </Text>

                            <TouchableOpacity style={styles.imageSelector} onPress={selectImage}>
                                {selectedImage ? (
                                    <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
                                ) : (
                                    <View style={styles.imagePlaceholder}>
                                        <MaterialCommunityIcons name="camera-off" size={32} color="#999" />
                                        <Text style={styles.imagePlaceholderText}>Nenhuma foto</Text>
                                        <Text style={styles.imagePlaceholderSubtext}>Toque para adicionar</Text>
                                    </View>
                                )}
                            </TouchableOpacity>

                            {selectedImage && (
                                <TouchableOpacity
                                    style={styles.removeImageButton}
                                    onPress={() => setSelectedImage(null)}
                                >
                                    <FontAwesome5 name="trash" size={14} color="#FF5252" />
                                    <Text style={styles.removeImageText}>Remover foto</Text>
                                </TouchableOpacity>
                            )}
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
                                disabled={uploadingImage}
                                onPress={onCancel}
                            >
                                <Text style={[
                                    styles.modalButtonTextCancel,
                                    uploadingImage && { color: '#ccc' }
                                ]}>Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton]}
                                disabled={uploadingImage}
                                onPress={handleSave}
                            >
                                {uploadingImage ? (
                                    <ActivityIndicator color={COLORS.background} size="small" />
                                ) : (
                                    <Text style={styles.modalButtonTextConfirm}>Salvar</Text>
                                )}
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
    imageSelector: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#fff',
    },
    imagePreview: {
        width: '100%',
        height: 150,
        resizeMode: 'cover',
    },
    imagePlaceholder: {
        width: '100%',
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    imagePlaceholderText: {
        marginTop: 8,
        color: '#999',
        fontSize: 14,
    },
    removeImageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        padding: 8,
    },
    removeImageText: {
        marginLeft: 5,
        color: '#FF5252',
        fontSize: 12,
    },
    imagePlaceholderSubtext: {
        marginTop: 4,
        color: '#bbb',
        fontSize: 12,
    },
});