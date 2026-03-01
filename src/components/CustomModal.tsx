// src/components/CustomModal.tsx

import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    StyleSheet,
} from 'react-native';
import { COLORS } from '@/constants/colors';

interface Option {
    id: string;
    title: string;
    icon?: string;
    onPress: () => void;
}

interface OptionsModalProps {
    visible: boolean;
    title: string;
    options: Option[];
    onClose: () => void;
}

export default function OptionsModal({ visible, title, options, onClose }: OptionsModalProps) {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.content}>
                    <Text style={styles.title}>{title}</Text>

                    {options.map((option) => (
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

                    <TouchableOpacity
                        style={styles.cancel}
                        onPress={onClose}
                    >
                        <Text style={styles.cancelText}>Cancelar</Text>
                    </TouchableOpacity>
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
        width: '80%',
        maxWidth: 300,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 20,
        textAlign: 'center',
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