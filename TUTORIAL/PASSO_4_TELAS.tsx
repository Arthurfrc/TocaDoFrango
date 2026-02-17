// PASSO 4: TELAS PRINCIPAIS

// src/screens/HomeScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';

export default function HomeScreen({ navigation }: any) {
  return (
    <ScrollView style={styles.container}>
      {/* Header com Logo */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <Text style={styles.title}>🐔 Toca do Frango</Text>
        <Text style={styles.subtitle}>O melhor frango assado da cidade!</Text>
      </LinearGradient>

      {/* Botões de Ação Rápida */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={[styles.button, styles.menuButton]}
          onPress={() => navigation.navigate('Menu')}
        >
          <Text style={styles.buttonText}>🍗 Ver Cardápio</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.cartButton]}
          onPress={() => navigation.navigate('Cart')}
        >
          <Text style={styles.buttonText}>🛒 Meu Pedido</Text>
        </TouchableOpacity>
      </View>

      {/* Informações */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>⏰ Horário de Funcionamento</Text>
        <Text style={styles.infoText}>Segunda a Sábado: 18h às 23h</Text>
        <Text style={styles.infoText}>Domingo: 18h às 22h</Text>
        
        <Text style={styles.sectionTitle}>📍 Localização</Text>
        <Text style={styles.infoText}>Rua das Galinhas, 123</Text>
        <Text style={styles.infoText}>Centro - Cidade/UF</Text>
        
        <Text style={styles.sectionTitle}>📞 Contato</Text>
        <Text style={styles.infoText}>(11) 99999-9999</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.background,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.background,
    opacity: 0.9,
  },
  quickActions: {
    padding: 20,
    gap: 15,
  },
  button: {
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuButton: {
    backgroundColor: COLORS.primary,
  },
  cartButton: {
    backgroundColor: COLORS.secondary,
  },
  buttonText: {
    color: COLORS.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoSection: {
    padding: 20,
    backgroundColor: '#F5F5F5',
    margin: 20,
    borderRadius: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 15,
    marginBottom: 5,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 2,
  },
});
