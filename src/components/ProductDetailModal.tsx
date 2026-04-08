// src/components/ProductDetailModal.tsx

import React from 'react';
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
    onAddToCart: (productId: string) => void;
}

export default function ProductDetailModal({
    visible,
    product,
    onClose,
    onAddToCart,
}: ProductDetailModalProps) {
    const handleAddToCart = () => {
        if (product) {
            onAddToCart(product.id);
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
});