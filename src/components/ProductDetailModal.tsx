// src/components/ProductDetailModal.tsx

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { Product } from '@/types';

interface ProductDetailModalProps {
    visible: boolean;
    product: Product | null;
    onClose: () => void;
    onAddToCart: (productId: string, quantity: number) => void;
}

export default function ProductDetailModal({
    visible,
    product,
    onClose,
    onAddToCart,
}: ProductDetailModalProps) {
    const [quantity, setQuantity] = useState(1);
    const increaseQuantity = () => setQuantity(prev => prev + 1);
    const decreaseQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

    useEffect(() => {
        setQuantity(1);
    }, [product]);

    const handleAddToCart = () => {
        if (product) {
            onAddToCart(product.id, quantity);
            onClose();
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    {/* Imagem */}
                    {product?.image ? (
                        <Image
                            source={{ uri: product.image }}
                            style={styles.modalImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={styles.modalImagePlaceholder}>
                            <MaterialCommunityIcons
                                name="camera-off"
                                size={48}
                                color="#ccc"
                            />
                        </View>
                    )}

                    {/* Informações */}
                    <View style={styles.modalInfo}>
                        <Text style={styles.modalName}>{product?.name}</Text>
                        <Text style={styles.modalDescription}>
                            {product?.description || 'Sem descrição disponível'}
                        </Text>
                        <Text style={styles.modalPrice}>
                            R$ {product?.price.toFixed(2)}
                        </Text>

                        {product?.hasStockControl && (
                            <Text style={styles.modalStock}>
                                Estoque: {product.stock || 0} unidades
                            </Text>
                        )}
                    </View>

                    <View style={styles.quantitySelector}>
                        <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={decreaseQuantity}
                            disabled={quantity <= 1}
                        >
                            <MaterialCommunityIcons name="minus" size={20} color={quantity <= 1 ? '#ccc' : COLORS.primary} />
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{quantity}</Text>
                        <TouchableOpacity style={styles.quantityButton} onPress={increaseQuantity}>
                            <MaterialCommunityIcons name="plus" size={20} color={COLORS.primary} />
                        </TouchableOpacity>
                    </View>

                    {/* Botões */}
                    <View style={styles.modalActions}>
                        <TouchableOpacity
                            style={styles.modalCancelButton}
                            onPress={onClose}
                        >
                            <Text style={styles.modalCancelText}>Fechar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalAddButton}
                            onPress={handleAddToCart}
                        >
                            <MaterialCommunityIcons
                                name="cart-plus"
                                size={20}
                                color="white"
                            />
                            <Text style={styles.modalAddText}>Adicionar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 15,
        width: '90%',
        maxWidth: 400,
        maxHeight: '80%',
        overflow: 'hidden',
    },
    modalImage: {
        width: '100%',
        height: 200,
        backgroundColor: '#f0f0f0',
    },
    modalImagePlaceholder: {
        width: '100%',
        height: 200,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalInfo: {
        padding: 20,
    },
    modalName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 10,
    },
    modalDescription: {
        fontSize: 16,
        color: '#666',
        lineHeight: 22,
        marginBottom: 15,
    },
    modalPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 10,
    },
    modalStock: {
        fontSize: 14,
        color: '#999',
        fontStyle: 'italic',
    },
    modalActions: {
        flexDirection: 'row',
        padding: 20,
        gap: 10,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    modalCancelButton: {
        flex: 1,
        padding: 15,
        backgroundColor: '#E0E0E0',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalCancelText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    modalAddButton: {
        flex: 2,
        flexDirection: 'row',
        padding: 15,
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    modalAddText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
    quantitySelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        backgroundColor: '#F8F8F8',
        borderRadius: 10,
        padding: 10,
    },
    quantityButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 15,
    },
    quantityText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        minWidth: 30,
        textAlign: 'center',
    },
});