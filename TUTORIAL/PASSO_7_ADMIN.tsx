// PASSO 7: PAINEL ADMINISTRATIVO

// src/screens/AdminScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { COLORS } from '../constants/colors';
import { MENU_DATA, Product } from '../data/menu';

export default function AdminScreen({ navigation }: any) {
  const [products, setProducts] = useState<Product[]>(MENU_DATA);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
  });

  const openEditModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        category: product.category,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
      });
    }
    setModalVisible(true);
  };

  const saveProduct = () => {
    if (!formData.name || !formData.price || !formData.category) {
      Alert.alert('⚠️ Campos Obrigatórios', 'Preencha nome, preço e categoria!');
      return;
    }

    const productData: Product = {
      id: editingProduct?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      available: true,
    };

    if (editingProduct) {
      // Editar produto existente
      setProducts(products.map(p => p.id === editingProduct.id ? productData : p));
      Alert.alert('✅ Sucesso', 'Produto atualizado!');
    } else {
      // Adicionar novo produto
      setProducts([...products, productData]);
      Alert.alert('✅ Sucesso', 'Produto adicionado!');
    }

    setModalVisible(false);
  };

  const deleteProduct = (productId: string) => {
    Alert.alert(
      '🗑️ Confirmar Exclusão',
      'Tem certeza que deseja excluir este produto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            setProducts(products.filter(p => p.id !== productId));
            Alert.alert('✅ Sucesso', 'Produto excluído!');
          }
        }
      ]
    );
  };

  const toggleProductAvailability = (productId: string) => {
    setProducts(products.map(p => 
      p.id === productId ? { ...p, available: !p.available } : p
    ));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔧 Painel Admin</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => openEditModal()}
        >
          <Text style={styles.addButtonText}>+ Novo Produto</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {products.map(product => (
          <View key={product.id} style={styles.productCard}>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productCategory}>{product.category}</Text>
              <Text style={styles.productDescription}>{product.description}</Text>
              <Text style={styles.productPrice}>R$ {product.price.toFixed(2)}</Text>
              <View style={styles.statusContainer}>
                <Text style={styles.statusText}>
                  Status: {product.available ? '✅ Disponível' : '❌ Indisponível'}
                </Text>
              </View>
            </View>
            
            <View style={styles.actions}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.editButton]}
                onPress={() => openEditModal(product)}
              >
                <Text style={styles.actionButtonText}>✏️</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.toggleButton]}
                onPress={() => toggleProductAvailability(product.id)}
              >
                <Text style={styles.actionButtonText}>
                  {product.available ? '🔴' : '🟢'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => deleteProduct(product.id)}
              >
                <Text style={styles.actionButtonText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Modal de Edição */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingProduct ? '✏️ Editar Produto' : '➕ Novo Produto'}
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Nome do produto"
              value={formData.name}
              onChangeText={(text) => setFormData({...formData, name: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Descrição"
              value={formData.description}
              onChangeText={(text) => setFormData({...formData, description: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Preço"
              value={formData.price}
              onChangeText={(text) => setFormData({...formData, price: text})}
              keyboardType="numeric"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Categoria"
              value={formData.category}
              onChangeText={(text) => setFormData({...formData, category: text})}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveProduct}
              >
                <Text style={styles.modalButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.background,
  },
  addButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addButtonText: {
    color: COLORS.background,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  productCard: {
    backgroundColor: '#FFF',
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5,
  },
  productCategory: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: 'bold',
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
    marginBottom: 5,
  },
  statusContainer: {
    marginTop: 5,
  },
  statusText: {
    fontSize: 12,
    color: COLORS.text,
  },
  actions: {
    flexDirection: 'column',
    gap: 5,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  toggleButton: {
    backgroundColor: '#FF9800',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    padding: 30,
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  modalButtonText: {
    fontWeight: 'bold',
    color: COLORS.background,
  },
});
