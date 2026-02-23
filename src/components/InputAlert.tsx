// src/components/InputAlert.tsx

import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';

import { COLORS } from '@/constants/colors';

interface InputAlertProps {
    visible: boolean;
    title: string;
    message: string;
    placeholder?: string;
    secureTextEntry?: boolean;
    onConfirm: (text: string) => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
}

export default function InputAlert({
    visible, title, message, placeholder = 'Digite aqui', secureTextEntry = false,
    onConfirm, onCancel, confirmText, cancelText
}: InputAlertProps) {

    const [inputValue, setInputValue] = useState('');
    const finalConfirmText = confirmText || 'Confirmar';
    const finalCancelText = cancelText || 'Cancelar';

    const handleConfirm = () => {
        onConfirm(inputValue);
        setInputValue('');
    };

    const handleCancel = () => {
        onCancel();
        setInputValue('');
    };

    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="fade"
            onRequestClose={handleCancel}
        >
            <View style={styles.overlay}>
                <View style={styles.alertBox}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>

                    <TextInput
                        style={styles.input}
                        value={inputValue}
                        onChangeText={setInputValue}
                        placeholder={placeholder}
                        secureTextEntry={secureTextEntry}
                        autoFocus
                        placeholderTextColor={COLORS.textSecondary}
                    />

                    <View style={styles.buttonContainer}>
                        {cancelText && cancelText.trim() !== '' &&
                            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                                <Text style={styles.cancelButtonText}>{finalCancelText}</Text>
                            </TouchableOpacity>}

                        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                            <Text style={styles.confirmButtonText}>{finalConfirmText}</Text>
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
    },
    input: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
        marginBottom: 20,
        backgroundColor: '#FFF',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cancelButton: {
        flex: 1,
        backgroundColor: COLORS.border,
        padding: 15,
        borderRadius: 10,
        marginRight: 10,
    },
    confirmButton: {
        flex: 1,
        backgroundColor: COLORS.primary,
        padding: 15,
        borderRadius: 10,
        marginLeft: 10,
    },
    cancelButtonText: {
        color: COLORS.text,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    confirmButtonText: {
        color: '#FFF',
        textAlign: 'center',
        fontWeight: 'bold',
    },
});