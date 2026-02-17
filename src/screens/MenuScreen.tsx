// src/screens/MenuScreen.tsx

import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";

import { COLORS } from "@/constants/colors";
import { getMenuByCategory, MENU_DATA } from "@/data/menu";
import { MaterialIcons } from "@expo/vector-icons";

export default function MenuScreen({ navigation }: any) {
    const [cart, setCart] = useState<{ [key: string]: number }>({});
    const menuByCategory = getMenuByCategory();

    const addToCart = (productId: string) => {
        setCart(prev => ({
            ...prev,
            [productId]: (prev[productId] || 0) + 1
        }));
        Alert.alert('✅ Adicionado!', 'Produto adicionado ao carrinho');
    };

    const getTotalItems = () => {
        return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>🍗 Cardápio</Text>

            {Object.entries(menuByCategory).map(([category, products]) => (
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
                                onPress={() => addToCart(product.id)}
                            >
                                <Text style={styles.addButtonText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            ))}

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
});