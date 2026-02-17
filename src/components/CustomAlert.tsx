// src/components/CustomAlert.tsx

import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { COLORS } from '@/constants/colors';

interface CustomAlertProps {
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
}

export default function CustomAlert({
    visible, title, message, onConfirm, onCancel,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar'
}: CustomAlertProps) {
    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <View style={styles.alertBox}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                            <Text style={styles.cancelButtonText}>{cancelText}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
                            <Text style={styles.confirmButtonText}>{confirmText}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertBox: {
        backgroundColor: '#FFF',
        borderRadius: 15,
        padding: 25,
        margin: 20,
        minWidth: 300,
        elevation: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 10,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: COLORS.text,
        marginBottom: 20,
        textAlign: 'center',
        lineHeight: 22,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#E0E0E0',
        padding: 12,
        borderRadius: 8,
        marginRight: 10,
        alignItems: 'center',
    },
    confirmButton: {
        flex: 1,
        backgroundColor: COLORS.primary,
        padding: 12,
        borderRadius: 8,
        marginLeft: 10,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: 'bold',
    },
    confirmButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});