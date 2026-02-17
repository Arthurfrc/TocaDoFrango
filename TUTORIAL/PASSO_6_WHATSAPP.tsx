// PASSO 6: INTEGRAÇÃO WHATSAPP E CHECKOUT

// src/screens/CartScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { COLORS } from '../constants/colors';
import { getProductById } from '../data/menu';

export default function CartScreen({ route, navigation }: any) {
  const { cart } = route.params || {};
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: ''
  });

  const getCartItems = () => {
    const items = [];
    for (const [productId, quantity] of Object.entries(cart || {})) {
      const product = getProductById(productId);
      if (product) {
        items.push({
          ...product,
          quantity: quantity as number
        });
      }
    }
    return items;
  };

  const getTotal = () => {
    return getCartItems().reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const formatWhatsAppMessage = () => {
    const items = getCartItems();
    let message = `🐔 *NOVO PEDIDO - TOCA DO FRANGO* 🐔\n\n`;
    
    message += `👤 *Cliente:* ${customerInfo.name}\n`;
    message += `📞 *Telefone:* ${customerInfo.phone}\n`;
    message += `📍 *Endereço:* ${customerInfo.address}\n\n`;
    
    message += `🛒 *PEDIDO:*\n`;
    message += `${'─'.repeat(30)}\n`;
    
    items.forEach(item => {
      message += `🍗 ${item.name}\n`;
      message += `   Quantidade: ${item.quantity}\n`;
      message += `   Unitário: R$ ${item.price.toFixed(2)}\n`;
      message += `   Subtotal: R$ ${(item.price * item.quantity).toFixed(2)}\n\n`;
    });
    
    message += `${'─'.repeat(30)}\n`;
    message += `💰 *TOTAL: R$ ${getTotal().toFixed(2)}*\n\n`;
    message += `⏰ *Data:* ${new Date().toLocaleString('pt-BR')}\n\n`;
    message += `🔔 *Por favor, confirmar o pedido!*`;
    
    return message;
  };

  const sendToWhatsApp = () => {
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
      Alert.alert('⚠️ Campos Obrigatórios', 'Por favor, preencha todos os seus dados!');
      return;
    }

    const message = formatWhatsAppMessage();
    const phoneNumber = '5511999999999'; // SEU NÚMERO DE WHATSAPP AQUI
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    Alert.alert(
      '📱 Enviar Pedido',
      'Deseja enviar este pedido para o WhatsApp?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Enviar', 
          onPress: () => {
            // Aqui você abriria o WhatsApp
            // Para teste, vamos mostrar a mensagem
            Alert.alert('📋 Mensagem Gerada:', message);
          }
        }
      ]
    );
  };

  const cartItems = getCartItems();

  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>🛒 Seu carrinho está vazio!</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate('Menu')}
        >
          <Text style={styles.backButtonText}>Ver Cardápio</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🛒 Meu Pedido</Text>
      
      {/* Itens do Carrinho */}
      <View style={styles.itemsSection}>
        {cartItems.map((item, index) => (
          <View key={index} style={styles.itemCard}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemDetails}>
                {item.quantity}x R$ {item.price.toFixed(2)} = R$ {(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Total */}
      <View style={styles.totalSection}>
        <Text style={styles.totalText}>💰 Total: R$ {getTotal().toFixed(2)}</Text>
      </View>

      {/* Formulário Cliente */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>👤 Seus Dados</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Seu nome completo"
          value={customerInfo.name}
          onChangeText={(text) => setCustomerInfo({...customerInfo, name: text})}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Seu telefone com DDD"
          value={customerInfo.phone}
          onChangeText={(text) => setCustomerInfo({...customerInfo, phone: text})}
          keyboardType="phone-pad"
        />
        
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Endereço de entrega"
          value={customerInfo.address}
          onChangeText={(text) => setCustomerInfo({...customerInfo, address: text})}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Botão Enviar */}
      <TouchableOpacity style={styles.sendButton} onPress={sendToWhatsApp}>
        <Text style={styles.sendButtonText}>📱 Enviar para WhatsApp</Text>
      </TouchableOpacity>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  emptyText: {
    fontSize: 20,
    color: COLORS.text,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 10,
  },
  backButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemsSection: {
    marginBottom: 20,
  },
  itemCard: {
    backgroundColor: '#FFF',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 2,
  },
  itemInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  itemDetails: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  totalSection: {
    backgroundColor: COLORS.secondary,
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.background,
  },
  formSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 40,
  },
  sendButtonText: {
    color: COLORS.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
