// src/screens/MenuScreen.tsx

import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";

import { COLORS } from "@/constants/colors";
import { useMenu } from "@/context/MenuContext";
import { useCart } from "@/context/CartContext";
import { getCategoryName } from "@/utils";
import { MaterialIcons } from "@expo/vector-icons";
import CustomAlert from "@/components/CustomAlert";

export default function MenuScreen({ navigation }: any) {
    const { cart, addToCart } = useCart();
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ title: '', message: '' });
    const { products, categories } = useMenu();
    const menuByCategory = products
        .filter(product => product.available)
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

    const handleAddToCart = (productId: string) => {
        addToCart(productId, products);
        setAlertConfig({
            title: '✅ Adicionado!',
            message: 'Produto adicionado ao carrinho'
        });
        setAlertVisible(true);
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>🍗 Cardápio</Text>

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

            {Object.entries(menuByCategory).sort(([a], [b]) => a.localeCompare(b)).map(([category, products]) => (

                <View key={category} style={styles.categorySection}>
                    <Text style={styles.categoryTitle}>{category}</Text>

                    {products.map(product => (
                        <View key={product.id} style={styles.productCard}>
                            <View style={styles.productInfo}>
                                <Text style={styles.productName}>{product.name}</Text>
                                <Text style={styles.productDescription}>{product.description}</Text>
                                <Text style={styles.productPrice}>R$ {product.price.toFixed(2)}</Text>
                            </View>

                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={() => handleAddToCart(product.id)}
                            >
                                <Text style={styles.addButtonText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            ))}
            <CustomAlert
                visible={alertVisible}
                title={alertConfig.title}
                message={alertConfig.message}
                onConfirm={() => setAlertVisible(false)}
                onCancel={() => setAlertVisible(false)}
                confirmText="OK"
                cancelText=""
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
        color: COLORS.primary,
        marginBottom: 20,
        textAlign: 'center',
    },
    categorySection: {
        marginBottom: 25,
    },
    categoryTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 15,
        borderBottomWidth: 2,
        borderBottomColor: COLORS.secondary,
        paddingBottom: 5,
    },
    productCard: {
        backgroundColor: '#FFF',
        padding: 15,
        marginBottom: 10,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    productInfo: {
        flex: 1,
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
        color: COLORS.primary,
    },
    addButton: {
        backgroundColor: COLORS.primary,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
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
});