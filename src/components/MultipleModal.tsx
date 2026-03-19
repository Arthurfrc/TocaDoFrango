// src/components/MultipleModal.tsx
import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    StyleSheet,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { COLORS } from '@/constants/colors';

interface Option {
    id: string;
    title: string;
    icon?: string;
    onPress: () => void;
}

interface InputField {
    id: string;
    label: string;
    placeholder?: string;
    value: string;
    onChangeText: (text: string) => void;
    keyboardType?: 'default' | 'phone-pad' | 'email-address' | 'numeric';
    multiline?: boolean;
    maxLength?: number;
    flex?: number;
    row?: number;
    textAlign?: 'left' | 'center' | 'right';
}

interface MultipleModalProps {
    visible: boolean;
    title: string;
    options?: Option[];
    inputs?: InputField[];
    onClose: () => void;
    onConfirm?: () => void;
    confirmText?: string;
}

// Agrupa os inputs por número de linha
const groupByRow = (inputs: InputField[]) => {
    const rows: InputField[][] = [];
    const standalone: InputField[] = [];

    const rowMap: { [key: number]: InputField[] } = {};

    inputs.forEach((field) => {
        if (field.row !== undefined) {
            if (!rowMap[field.row]) rowMap[field.row] = [];
            rowMap[field.row].push(field);
        } else {
            standalone.push(field);
        }
    });

    // Ordena as linhas por número
    Object.keys(rowMap)
        .sort((a, b) => Number(a) - Number(b))
        .forEach((key) => rows.push(rowMap[Number(key)]));

    return { rows, standalone };
};

export default function MultipleModal({
    visible,
    title,
    options,
    inputs,
    onClose,
    onConfirm,
    confirmText = 'Confirmar',
}: MultipleModalProps) {
    const { rows, standalone } = inputs ? groupByRow(inputs) : { rows: [], standalone: [] };

    const renderField = (field: InputField) => (
        <View key={field.id} style={[styles.inputGroup, field.flex ? { flex: field.flex } : {}]}>
            <Text style={styles.inputLabel}>{field.label}</Text>
            <TextInput
                style={[styles.input, field.multiline && styles.inputMultiline]}
                placeholder={field.placeholder}
                value={field.value}
                onChangeText={field.onChangeText}
                keyboardType={field.keyboardType || 'default'}
                multiline={field.multiline}
                maxLength={field.maxLength}
                placeholderTextColor="#aaa"
                textAlign={field.textAlign || 'left'}
            />
        </View>
    );

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.overlay}
            >
                <View style={styles.content}>
                    <Text style={styles.title}>{title}</Text>

                    <ScrollView showsVerticalScrollIndicator={false}>

                        {/* Campos em linha (com row definido) */}
                        {rows.map((rowFields, index) => (
                            <View key={`row-${index}`} style={styles.row}>
                                {rowFields.map((field, i) => (
                                    <React.Fragment key={field.id}>
                                        {renderField(field)}
                                        {/* Espaço entre campos da mesma linha */}
                                        {i < rowFields.length - 1 && <View style={styles.rowGap} />}
                                    </React.Fragment>
                                ))}
                            </View>
                        ))}

                        {/* Campos soltos (sem row) */}
                        {standalone.map(renderField)}

                        {/* Opções de seleção */}
                        {options && options.map((option) => (
                            <TouchableOpacity
                                key={option.id}
                                style={styles.option}
                                onPress={() => {
                                    option.onPress();
                                    onClose();
                                }}
                            >
                                <Text style={styles.optionText}>
                                    {option.icon && `${option.icon} `}{option.title}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {inputs && onConfirm && (
                        <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
                            <Text style={styles.confirmText}>{confirmText}</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity style={styles.cancel} onPress={onClose}>
                        <Text style={styles.cancelText}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
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
        width: '85%',
        maxWidth: 350,
        maxHeight: '80%',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 20,
        textAlign: 'center',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    rowGap: {
        width: 8,
    },
    inputGroup: {
        marginBottom: 12,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 5,
    },
    input: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 8,
        padding: 12,
        fontSize: 15,
        color: COLORS.text,
    },
    inputMultiline: {
        height: 80,
        textAlignVertical: 'top',
    },
    option: {
        backgroundColor: COLORS.primary,
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    optionText: {
        color: COLORS.background,
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    confirmButton: {
        backgroundColor: COLORS.primary,
        padding: 15,
        borderRadius: 10,
        marginTop: 10,
    },
    confirmText: {
        color: COLORS.background,
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    cancel: {
        backgroundColor: '#ccc',
        padding: 15,
        borderRadius: 10,
        marginTop: 10,
    },
    cancelText: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});