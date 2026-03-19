// src/screens/DeliveryZonesScreen.tsx

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Alert,
    StyleSheet,
    ScrollView,
    TextInput
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { deliveryService, DeliveryZone } from '@/services/deliveryService';
import CustomAlert from '@/components/CustomAlert';

export default function DeliveryZonesScreen({ navigation }: any) {
    const [zones, setZones] = useState<DeliveryZone[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
    const [zoneName, setZoneName] = useState('');
    const [zonePrice, setZonePrice] = useState('');
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '',
        message: '',
        onConfirm: () => { },
        onCancel: () => { },
        confirmText: 'Confirmar',
        cancelText: undefined as string | undefined,
    });

    useEffect(() => {
        loadZones();
    }, []);

    const loadZones = async () => {
        try {
            const data = await deliveryService.getDeliveryZones();
            setZones(data);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível carregar as zonas de entrega');
        } finally {
            setLoading(false);
        }
    };

    const showAlert = (
        title: string,
        message: string,
        onConfirm: () => void,
        onCancel: () => void,
        confirmText: string,
        cancelText?: string,
    ) => {
        setAlertConfig({
            title,
            message,
            onConfirm: () => {
                onConfirm();
                setAlertVisible(false);
            },
            onCancel: () => {
                onCancel();
                setAlertVisible(false);
            },
            confirmText,
            cancelText,
        });
        setAlertVisible(true);
    };

    const openModal = (zone?: DeliveryZone) => {
        if (zone) {
            setEditingZone(zone);
            setZoneName(zone.name);
            setZonePrice(zone.price.toFixed(2));
        } else {
            setEditingZone(null);
            setZoneName('');
            setZonePrice('');
        }
        setShowModal(true);
    };

    const saveZone = async () => {
        if (!zoneName.trim() || !zonePrice.trim()) {
            showAlert(
                '❌ Erro',
                'Preencha todos os campos',
                () => { },
                () => { },
                'OK');
            return;
        }

        try {
            const price = parseFloat(zonePrice.replace(',', '.'));
            if (isNaN(price) || price < 0) {
                showAlert(
                    '❌ Erro',
                    'Digite um preço válido',
                    () => { },
                    () => { },
                    'OK'
                );
                return;
            }

            if (editingZone?.id) {
                await deliveryService.updateDeliveryZone(editingZone.id, {
                    name: zoneName.trim(),
                    price: price
                });
            } else {
                await deliveryService.addDeliveryZone({
                    name: zoneName.trim(),
                    price: price,
                    active: true
                });
            }

            setShowModal(false);
            setEditingZone(null);
            setZoneName('');
            setZonePrice('');
            loadZones();
        } catch (error) {
            showAlert(
                '❌ Erro',
                'Não foi possível salvar a zona de entrega',
                () => { },
                () => { },
                'OK'
            );
        }
    };
    const deleteZone = (zone: DeliveryZone) => {
        showAlert(
            '🗑️ Confirmar Exclusão',
            `Tem certeza que deseja excluir "${zone.name}"?`,
            () => {
                deliveryService.deleteDeliveryZone(zone.id!);  // ✅ Ação principal
                loadZones();                             // ✅ Recarregar lista
            },
            () => { },             // ✅ Ação do cancel
            'Confirmar',              // ✅ Texto do confirm
            'Cancelar'                // ✅ Texto do cancel
        );
    };

    const toggleZoneActive = async (zone: DeliveryZone) => {
        try {
            await deliveryService.toggleDeliveryZone(zone.id!, !zone.active);
            loadZones();
        } catch (error) {
            showAlert(
                '❌ Erro',
                'Não foi possível atualizar',
                () => { },
                () => { },
                'OK'
            );
        }
    };

    const renderZone = ({ item }: { item: DeliveryZone }) => (
        <View style={styles.zoneItem}>
            <View style={styles.zoneInfo}>
                <View style={styles.zoneHeader}>
                    <Text style={styles.zoneName}>{item.name}</Text>
                </View>
                <Text style={styles.zonePrice}>R$ {item.price.toFixed(2)}</Text>
                <View style={styles.statusContainer}>
                    <Text style={styles.statusText}>
                        Status: {item.active ? '✅ Disponível' : '❌ Indisponível'}
                    </Text>
                </View>
            </View>
            <View style={styles.zoneActions}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => toggleZoneActive(item)}
                >
                    <FontAwesome5
                        name={item.active ? "eye-slash" : "eye"}
                        size={16}
                        color={COLORS.text}
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => openModal(item)}
                >
                    <FontAwesome5 name="edit" size={16} color={COLORS.text} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => deleteZone(item)}
                >
                    <FontAwesome5 name="trash" size={16} color={COLORS.text} />
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loading}>
                <Text>Carregando...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <FontAwesome5 name="arrow-left" size={18} color={COLORS.background} />
                </TouchableOpacity>
                <Text style={styles.title}>Zonas de Entrega</Text>
            </View>

            <TouchableOpacity
                style={styles.addButton}
                onPress={() => openModal()}
            >
                <FontAwesome5 name="plus" size={16} color={COLORS.background} />
                <Text style={styles.addButtonText}>Adicionar Bairro</Text>
            </TouchableOpacity>

            <FlatList
                data={zones}
                keyExtractor={(item) => item.id!}
                renderItem={renderZone}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
            />

            {/* Modal */}
            {showModal && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {editingZone ? 'Editar Bairro' : 'Novo Bairro'}
                        </Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Nome do Bairro</Text>
                            <TextInput style={styles.input}
                                placeholder="Ex: Emaús"
                                value={zoneName}
                                onChangeText={setZoneName}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Valor da Entrega</Text>
                            <TextInput style={styles.input}
                                placeholder="0,00"
                                value={zonePrice}
                                onChangeText={setZonePrice}
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setShowModal(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton]}
                                onPress={saveZone}
                            >
                                <Text style={styles.saveButtonText}>Salvar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}

            <CustomAlert
                visible={alertVisible}
                title={alertConfig.title}
                message={alertConfig.message}
                onConfirm={alertConfig.onConfirm}
                onCancel={alertConfig.onCancel}
                confirmText={alertConfig.confirmText}
                cancelText={alertConfig.cancelText}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        padding: 20,
        paddingTop: 50,
    },
    backButton: {
        marginRight: 15,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.background,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        margin: 20,
        padding: 15,
        borderRadius: 10,
        gap: 10,
    },
    addButtonText: {
        color: COLORS.background,
        fontSize: 16,
        fontWeight: 'bold',
    },
    list: {
        padding: 20,
    },
    zoneItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    zoneInfo: {
        flex: 1,
    },
    zoneHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    zoneName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: COLORS.text,
        fontSize: 12,
        fontWeight: 'normal',
    },
    zonePrice: {
        fontSize: 16,
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    zoneActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        width: 35,
        height: 35,
        borderRadius: 17,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: COLORS.background,
        padding: 20,
        borderRadius: 15,
        width: '90%',
        maxWidth: 350,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 20,
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
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
    cancelButtonText: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    saveButtonText: {
        color: COLORS.background,
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    statusContainer: {
        marginTop: 3,
    },
});