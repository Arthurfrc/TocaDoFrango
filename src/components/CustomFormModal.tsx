// src/components/CustomFormModal.tsx

import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    StyleSheet,
    TextInput,
} from 'react-native';
import { COLORS } from '@/constants/colors';

interface CustomFormModalProps {
    visible: boolean;
    title: string;
    fieldLabel: string;
    fieldValue: string;
    fieldPlaceholder: string;
    onFieldChange: (value: string) => void;
    onSave: () => void;
    onCancel: () => void;
    saveButtonText?: string;
    icon?: string;
}

export default function CustomFormModal({
    visible,
    title,
    fieldLabel,
    fieldValue,
    fieldPlaceholder,
    onFieldChange,
    onSave,
    onCancel,
    saveButtonText = 'Salvar',
    icon
}: CustomFormModalProps) {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <View style={styles.content}>
                    <Text style={styles.title}>{title}</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>
                            {icon && `${icon} `}{fieldLabel}
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder={fieldPlaceholder}
                            value={fieldValue}
                            onChangeText={onFieldChange}
                        />
                    </View>

                    <View style={styles.modalActions}>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.cancelButton]}
                            onPress={onCancel}
                        >
                            <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.modalButton, styles.saveButton]}
                            onPress={onSave}
                        >
                            <Text style={styles.modalButtonTextConfirm}>{saveButtonText}</Text>
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
    content: {
        backgroundColor: COLORS.background,
        padding: 20,
        borderRadius: 15,
        width: '90%',
        maxWidth: 350,
    },
    title: {
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
});