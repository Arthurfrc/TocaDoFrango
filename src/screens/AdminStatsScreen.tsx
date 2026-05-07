// src/screens/AdminStatsScreen.tsx

import React, { useEffect, useState } from "react";
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, RefreshControl
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { orderService, OrderStats } from '@/services/orderService';

export default function AdminStatsScreen({ navigation }: any) {
    const [stats, setStats] = useState<OrderStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [todayOrders, setTodayOrders] = useState(0);

    const loadStats = async () => {
        try {
            const data = await orderService.getOrderStats(30); // últimos 30 dias
            setStats(data);
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadStats();
    }, []);

    useEffect(() => {
        if (stats) {
            const today = new Date().toISOString().split('T')[0];
            const todayOrdersCount = stats.revenueByDay.find(day => day.date === today)?.orders || 0;
            setTodayOrders(todayOrdersCount);
        }
    })

    const onRefresh = () => {
        setRefreshing(true);
        loadStats();
    };
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Carregando estatísticas...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <FontAwesome5 name="arrow-left" size={18} color={COLORS.background} />
                </TouchableOpacity>
                <Text style={styles.title}>📊 Estatísticas Mensais</Text>
            </View>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {stats && (
                    <>
                        {/* Cards Principais */}
                        <View style={styles.cardsContainer}>
                            <View style={[styles.card, styles.totalOrdersCard]}>
                                <FontAwesome5 name="shopping-cart" size={24} color={COLORS.background} />
                                <Text style={styles.cardValue}>{stats.totalOrders}</Text>
                                <Text style={styles.cardLabel}>Total de Pedidos</Text>
                            </View>

                            <View style={[styles.card, styles.revenueCard]}>
                                <FontAwesome5 name="dollar-sign" size={24} color={COLORS.background} />
                                <Text style={styles.cardValue}>R$ {stats.totalRevenue.toFixed(2)}</Text>
                                <Text style={styles.cardLabel}>Faturamento Total</Text>
                            </View>

                            <View style={[styles.card, styles.averageCard]}>
                                <FontAwesome5 name="chart-line" size={24} color={COLORS.background} />
                                <Text style={styles.cardValue}>R$ {stats.averageTicket.toFixed(2)}</Text>
                                <Text style={styles.cardLabel}>Ticket Médio</Text>
                            </View>

                            <View style={[styles.card, styles.todayOrdersCard]}>
                                <FontAwesome5 name="calendar-day" size={24} color={COLORS.background} />
                                <Text style={styles.cardValue}>{todayOrders}</Text>
                                <Text style={styles.cardLabel}>Pedidos Hoje</Text>
                            </View>
                        </View>

                        {/* Entrega vs Retirada */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>🚚 Entrega vs Retirada</Text>
                            <View style={styles.deliveryStats}>
                                <View style={styles.deliveryItem}>
                                    <Text style={styles.deliveryCount}>{stats.deliveryVsRetirada.entrega}</Text>
                                    <Text style={styles.deliveryLabel}>Entregas</Text>
                                </View>
                                <View style={styles.deliveryItem}>
                                    <Text style={styles.deliveryCount}>{stats.deliveryVsRetirada.retirada}</Text>
                                    <Text style={styles.deliveryLabel}>Retiradas</Text>
                                </View>
                            </View>
                        </View>

                        {/* Produtos Mais Vendidos */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>🏆 Produtos Mais Vendidos</Text>
                            {stats.topProducts.map((product, index) => (
                                <View key={index} style={styles.productItem}>
                                    <Text style={styles.productName}>{product.name}</Text>
                                    <View style={styles.productStats}>
                                        <Text style={styles.productQuantity}>{product.quantity}x</Text>
                                        <Text style={styles.productRevenue}>R$ {product.revenue.toFixed(2)}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        backgroundColor: COLORS.primary,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: COLORS.text,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    cardsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
        gap: 10,
    },
    card: {
        width: '48%',
        backgroundColor: COLORS.primary,
        padding: 25,
        borderRadius: 15,
        alignItems: 'center',
        elevation: 3,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    totalOrdersCard: {
        backgroundColor: COLORS.primary,
    },
    revenueCard: {
        backgroundColor: COLORS.success,
    },
    averageCard: {
        backgroundColor: COLORS.admin,
    },
    cardValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.background,
        marginTop: 10,
    },
    cardLabel: {
        fontSize: 14,
        color: COLORS.background,
        marginTop: 5,
        textAlign: 'center',
    },
    section: {
        backgroundColor: COLORS.backgroundPlaceholder,
        padding: 20,
        borderRadius: 15,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 15,
    },
    deliveryStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    deliveryItem: {
        alignItems: 'center',
    },
    deliveryCount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    deliveryLabel: {
        fontSize: 14,
        color: COLORS.text,
        marginTop: 5,
    },
    productItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    productName: {
        fontSize: 16,
        color: COLORS.text,
        flex: 1,
    },
    productStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    productQuantity: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    productRevenue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.success,
    },
    todayOrdersCard: {
        backgroundColor: COLORS.adminBlue,
    },
});