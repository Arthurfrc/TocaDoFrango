// src/screens/MenuScreen.tsx

import React, { useState, useRef, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { COLORS } from "@/constants/colors";
import { useMenu } from "@/context/MenuContext";
import { useCart } from "@/context/CartContext";
import { getCategoryName } from "@/utils";
import { MaterialIcons } from "@expo/vector-icons";
import { Product } from "@/types";
import CustomAlert from "@/components/CustomAlert";
import ProductDetailModal from "@/components/ProductDetailModal";


const normalizeString = (str: string) => {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

export default function MenuScreen({ navigation }: any) {
    const { cart, addToCart } = useCart();
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ title: '', message: '' });
    const { products, categories } = useMenu();
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const [searchText, setSearchText] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const scrollViewRef = useRef<ScrollView>(null);
    const categoryRefs = useRef<{ [key: string]: View | null }>({});

    const normalizeSearch = normalizeString(searchText);

    const productsWithNormalizedName = useMemo(() => {
        return products.map(product => ({
            ...product,
            normalizedName: normalizeString(product.name)
        }));
    }, [products]);

    const menuByCategory = productsWithNormalizedName
        .filter(product =>
            product.available &&
            product.normalizedName.includes(normalizeSearch)
        )
        .sort((a, b) => a.name.localeCompare(b.name))
        .reduce((acc, product) => {
            const categoryName = getCategoryName(product, categories);
            if (!acc[categoryName]) {
                acc[categoryName] = [];
            }
            acc[categoryName].push(product);
            return acc;
        }, {} as { [key: string]: typeof products });

    const getTotalItems = () => {
        return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
    }

    const showAlert = (title: string, message: string) => {
        setAlertConfig({ title, message });
        setAlertVisible(true);
    };

    const toggleCategoryExpansion = (categoryName: string) => {
        const isOpening = expandedCategory !== categoryName;

        setExpandedCategory(prev => prev === categoryName ? null : categoryName);

        if (isOpening) {
            // Pequeno delay para o layout renderizar antes de medir
            setTimeout(() => {
                const categoryView = categoryRefs.current[categoryName];
                if (categoryView && scrollViewRef.current) {
                    categoryView.measureLayout(
                        scrollViewRef.current as any,
                        (_x, y) => {
                            scrollViewRef.current?.scrollTo({ y, animated: true });
                        },
                        () => { }
                    );
                }
            }, 50);
        }
    };

    // Fecha todas as categorias quando a tela ganha foco
    useFocusEffect(
        React.useCallback(() => {
            setExpandedCategory(null);
            setSearchText('');
            return () => { };
        }, [])
    );

    const handleAddToCart = (productId: string) => {
        const product = products.find(p => p.id === productId);

        if (product?.hasStockControl && (!product.stock || product.stock <= 0)) {
            showAlert('❌ Sem Estoque!', 'Este produto está esgotado no momento.');
            return;
        }

        const wasAdded = addToCart(productId, products);
        if (wasAdded) {
            showAlert('✅ Adicionado!', 'Produto adicionado ao carrinho');
        }
    };

    return (
        <ScrollView ref={scrollViewRef} style={styles.container}>
            <Text style={styles.title}>Cardápio</Text>

            <TextInput
                style={styles.searchInput}
                placeholder="🔍 Buscar produto..."
                value={searchText}
                onChangeText={setSearchText}
            />

            {getTotalItems() > 0 && (
                <TouchableOpacity
                    style={styles.checkoutButton}
                    onPress={() => navigation.navigate('Cart', { cart })}
                >
                    <MaterialIcons name="shopping-cart" size={24} color="white" />
                    <Text style={styles.checkoutText}>
                        Ver Carrinho ({getTotalItems()} itens)
                    </Text>
                </TouchableOpacity>
            )}

            {Object.entries(menuByCategory).sort(([a], [b]) => a.localeCompare(b)).map(([category, products]) => {
                const isExpanded = expandedCategory === category;

                return (
                    <View
                        key={category}
                        ref={ref => { categoryRefs.current[category] = ref; }}
                        style={styles.categorySection}
                    >
                        <TouchableOpacity
                            style={styles.categoryHeader}
                            onPress={() => toggleCategoryExpansion(category)}
                        >
                            <View style={styles.categoryHeaderContent}>
                                <MaterialIcons
                                    name={isExpanded ? "expand-more" : "chevron-right"}
                                    size={24}
                                    color={COLORS.primary}
                                    style={{ marginRight: 10 }}
                                />
                                <Text style={styles.categoryTitle}>{category}</Text>
                            </View>
                        </TouchableOpacity>

                        {isExpanded && (
                            <View style={styles.productsContainer}>
                                {products.map(product => (
                                    <View key={product.id} style={styles.productCard}>
                                        <TouchableOpacity 
                                            style={styles.productTouchable}
                                            onPress={() => setSelectedProduct(product)}
                                            activeOpacity={0.7}
                                        >
                                            {/* Imagem do Produto */}
                                            {product.image ? (
                                                <Image
                                                    source={{ uri: product.image }}
                                                    style={styles.productImage}
                                                    resizeMode="cover"
                                                />
                                            ) : (
                                                <View style={styles.productImagePlaceholder}>
                                                    <MaterialCommunityIcons name="camera-off" size={24} color="#ccc" />
                                                </View>
                                            )}

                                            <View style={styles.productInfo}>
                                                <Text style={styles.productName}>{product.name}</Text>
                                                <Text style={styles.productDescription} numberOfLines={2}>{product.description}</Text>
                                                <Text style={styles.productPrice}>R$ {product.price.toFixed(2)}</Text>
                                            </View>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.addButton}
                                            onPress={() => handleAddToCart(product.id)}
                                        >
                                            <MaterialIcons name="add-shopping-cart" size={24} color="white" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                );
            })}
            <CustomAlert
                visible={alertVisible}
                title={alertConfig.title}
                message={alertConfig.message}
                onConfirm={() => setAlertVisible(false)}
                onCancel={() => setAlertVisible(false)}
                confirmText="OK"
                cancelText=""
            />
            <ProductDetailModal
                visible={!!selectedProduct}
                product={selectedProduct}
                onClose={() => setSelectedProduct(null)}
                onAddToCart={handleAddToCart}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 20,
        textAlign: 'center',
    },

    categorySection: {
        marginBottom: 25,
    },
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
        borderLeftWidth: 3,
        borderLeftColor: '#FF6B35',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    categoryHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        flexWrap: 'wrap',
    },
    categoryTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
        flex: 1,
        flexWrap: 'wrap',
        maxWidth: '90%'
    },
    categoryCount: {
        fontSize: 14,
        color: '#666',
        marginLeft: 10,
    },
    productsContainer: {
        paddingLeft: 20,
    },
    productCard: {
        backgroundColor: '#E8E8E8',
        padding: 15,
        marginBottom: 10,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: '#F0F0F0',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.12,
        shadowRadius: 3,
        minHeight: 80,
    },
    productInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 5,
    },
    productDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.success,
    },
    addButton: {
        backgroundColor: COLORS.text,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    addButtonText: {
        color: COLORS.background,
        fontSize: 24,
        fontWeight: 'bold',
    },
    checkoutButton: {
        backgroundColor: COLORS.textSecondary,
        flexDirection: 'row',
        gap: 15,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        borderRadius: 15,
        marginTop: 20,
        marginBottom: 40,
    },
    checkoutText: {
        color: COLORS.background,
        fontSize: 18,
        fontWeight: 'bold',
    },
    stockText: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
    },
    searchInput: {
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: COLORS.primary,
        borderRadius: 25,
        padding: 15,
        paddingHorizontal: 20,
        fontSize: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
        marginRight: 12,
    },
    productImagePlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#f5f5f5',
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    productTouchable: {
        flex: 1,
        flexDirection: 'row',
    },
});