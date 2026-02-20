// src/screens/AdminScreen.tsx

import React, { useState } from 'react';
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	TextInput,
	Modal,
	KeyboardAvoidingView,
	Platform
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

import { COLORS } from '@/constants/colors';
import { Product } from '@/types';
import { useMenu } from '@/context/MenuContext';
import CustomAlert from '@/components/CustomAlert';

export default function AdminScreen({ navigation }: any) {
	const { products,
		addProduct,
		updateProduct,
		deleteProduct,
		toggleProductAvailability,
		hasUnsavedChanges,
		publishChanges,
		discardChanges,
		isPublishing,
		isLoading,
	} = useMenu();
	const [editingProduct, setEditingProduct] = useState<Product | null>(null);
	const [modalVisible, setModalVisible] = useState(false);
	const [alertVisible, setAlertVisible] = useState(false);
	const [alertConfig, setAlertConfig] = useState({
		title: '',
		message: '',
		onConfirm: () => { },
		onCancel: () => { },
		confirmText: 'Confirmar',
		cancelText: undefined as string | undefined,
	});

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
				price: Math.round(product.price * 100).toString(),
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

	// Função helper
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

	const displayPrice = (value: string): string => {
		if (!value) return '';
		return formatPrice(value);
	};

	// Atualizar a função saveProduct para tratar o novo formato
	const saveProduct = () => {
		if (!formData.name || !formData.price || !formData.category) {
			showAlert(
				'⚠️ Campos Obrigatórios',
				'Preencha nome, preço e categoria!',
				() => { },
				() => { },
				'Confirmar',
				''
			);
			return;
		}

		// Converte o preço formatado para número
		const priceValue = parseInt(formData.price) / 100;

		const productData: Product = {
			id: editingProduct?.id || Date.now().toString(),
			name: formData.name,
			description: formData.description,
			price: priceValue,
			category: formData.category,
			available: true,
		};

		if (editingProduct) {
			updateProduct(editingProduct.id, productData);
			showAlert(
				'✅ Sucesso',
				'Produto atualizado!',
				() => setModalVisible(false),
				() => { },
				'Confirmar',
				''
			);
		} else {
			addProduct(productData);
			showAlert(
				'✅ Sucesso',
				'Produto adicionado!',
				() => setModalVisible(false),
				() => { },
				'Confirmar',
				''
			);
		}
	};

	const handleDeleteProduct = (productId: string) => {
		showAlert(
			'🗑️ Confirmar Exclusão',
			'Tem certeza que deseja excluir este produto?',
			() => {
				deleteProduct(productId);
				// Não precisa de alert aqui, a ação já foi executada
			},
			() => { }, // Só fecha
			'Confirmar',
			'Cancelar'
		);
	};

	// Função para formatar o preço estilo MercadoLivre
	const formatPrice = (value: string): string => {
		if (!value) return '';

		// Remove tudo que não é número
		const numbers = value.replace(/\D/g, '');

		if (numbers.length === 0) return '';

		// Conte o valor como centavos diretos (estilo MercadoLivre)
		// Se digitar "3500" -> R$ 35,00
		// Se digitar "35" -> R$ 0,35
		const cents = parseInt(numbers);

		// Formata como moeda brasileira
		return (cents / 100).toFixed(2).replace('.', ',');
	};

	// Função para handle da mudança do preço
	const handlePriceChange = (text: string) => {
		// Remove formatação anterior (vírgula e ponto)
		const numbers = text.replace(/\D/g, '');

		if (numbers.length === 0) {
			setFormData({ ...formData, price: '' });
			return;
		}

		// Limita a 9 dígitos (99999.99)
		if (numbers.length > 9) return;

		// Armazena os números puros para conversão correta
		setFormData({ ...formData, price: numbers });
	};

	if (isLoading) {
		return (
			<View style={styles.loading}>
				<Text>Carregando menu...</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<View style={styles.headerLeft}>
					<TouchableOpacity
						style={styles.backButton}
						onPress={() => navigation.goBack()}
					>
						<FontAwesome5 name="arrow-left" size={18} color={COLORS.background} />
					</TouchableOpacity>
					<View style={styles.headerTitle}>
						<Text style={styles.title}>Painel Admin</Text>
					</View>
				</View>
				<View style={styles.headerRight}>
					<TouchableOpacity
						style={styles.addButton}
						onPress={() => openEditModal()}
					>
						<Text style={styles.addButtonText}>+ Produto</Text>
					</TouchableOpacity>
				</View>
			</View>

			{hasUnsavedChanges && (
				<View style={styles.actionBar}>
					<TouchableOpacity
						style={[styles.actionBarButton, styles.discardButton]}
						onPress={discardChanges}
						disabled={isPublishing}
					>
						<FontAwesome5 name="undo" size={16} color={COLORS.background} />
						<Text style={styles.actionBarText}>Descartar</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={[styles.actionBarButton, styles.publishButton, isPublishing && styles.publishButtonDisabled]}
						onPress={publishChanges}
						disabled={isPublishing}
					>
						<FontAwesome5 name="cloud-upload-alt" size={16} color={COLORS.background} />
						<Text style={styles.actionBarText}>
							{isPublishing ? 'Publicando...' : 'Publicar'}
						</Text>
					</TouchableOpacity>
				</View>
			)}

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
								<FontAwesome5 name="edit" size={16} color="white" />
							</TouchableOpacity>

							<TouchableOpacity
								style={[styles.actionButton, styles.toggleButton]}
								onPress={() => toggleProductAvailability(product.id)}
							>
								<FontAwesome5
									name={product.available ? "eye-slash" : "eye"}
									size={16}
									color="white"
								/>
							</TouchableOpacity>

							<TouchableOpacity
								style={[styles.actionButton, styles.deleteButton]}
								onPress={() => handleDeleteProduct(product.id)}
							>
								<FontAwesome5 name="trash" size={16} color="white" />
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
				<KeyboardAvoidingView
					behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
					style={styles.modalOverlay}
				>
					<View style={styles.modalContent}>
						<ScrollView showsVerticalScrollIndicator={false}>
							<Text style={styles.modalTitle}>
								{editingProduct ? '✏️ Editar Produto' : '➕ Novo Produto'}
							</Text>

							{/* Campo Nome */}
							<View style={styles.inputGroup}>
								<Text style={styles.inputLabel}>
									<FontAwesome5 name="tag" size={14} color={COLORS.primary} /> Nome do Produto
								</Text>
								<TextInput
									style={styles.input}
									placeholder="Digite o nome do produto"
									value={formData.name}
									onChangeText={(text) => setFormData({ ...formData, name: text })}
								/>
							</View>

							{/* Campo Descrição */}
							<View style={styles.inputGroup}>
								<Text style={styles.inputLabel}>
									<FontAwesome5 name="align-left" size={14} color={COLORS.primary} /> Descrição
								</Text>
								<TextInput
									style={[styles.input, styles.textArea]}
									placeholder="Descreva seu produto..."
									value={formData.description}
									onChangeText={(text) => setFormData({ ...formData, description: text })}
									multiline
								/>
							</View>

							{/* Campo Preço - Estilo OLX */}
							<View style={styles.inputGroup}>
								<Text style={styles.inputLabel}>
									<FontAwesome5 name="money-bill-wave" size={14} color={COLORS.primary} /> Preço
								</Text>
								<View style={styles.priceContainer}>
									<Text style={styles.pricePrefix}>R$</Text>
									<TextInput
										style={[
											styles.priceInput,
											displayPrice(formData.price) === '0,00' && { color: '#CCCCCC' }
										]}
										placeholder="0,00"
										placeholderTextColor="#CCCCCC"
										value={displayPrice(formData.price)}
										onChangeText={handlePriceChange}
										keyboardType="numeric"
										maxLength={12}
										selection={{
											start: displayPrice(formData.price).length,
											end: displayPrice(formData.price).length,
										}}
									/>
								</View>
							</View>

							{/* Campo Categoria */}
							<View style={styles.inputGroup}>
								<Text style={styles.inputLabel}>
									<FontAwesome5 name="folder" size={14} color={COLORS.primary} /> Categoria
								</Text>
								<TextInput
									style={styles.input}
									placeholder="Ex: Lanches, Bebidas, Sobremesas"
									value={formData.category}
									onChangeText={(text) => setFormData({ ...formData, category: text })}
								/>
							</View>

							<View style={styles.modalActions}>
								<TouchableOpacity
									style={[styles.modalButton, styles.cancelButton]}
									onPress={() => setModalVisible(false)}
								>
									<Text style={styles.modalButtonTextCancel}>Cancelar</Text>
								</TouchableOpacity>

								<TouchableOpacity
									style={[styles.modalButton, styles.saveButton]}
									onPress={saveProduct}
								>
									<Text style={styles.modalButtonTextConfirm}>Salvar</Text>
								</TouchableOpacity>
							</View>
						</ScrollView>
					</View>
				</KeyboardAvoidingView>
			</Modal>
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
		backgroundColor: COLORS.textSecondary,
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
		marginBottom: 40
	},
	productCard: {
		backgroundColor: '#FFF',
		padding: 15,
		marginBottom: 25,
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
		backgroundColor: '#4CAF50',
	},
	toggleButton: {
		backgroundColor: '#2196f3',
	},
	deleteButton: {
		backgroundColor: '#FF5252',
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
		paddingHorizontal: 30,
		paddingVertical: 20,
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
	textArea: {
		height: 80,
		textAlignVertical: 'top',
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
	modalButtonTextConfirm: {
		fontWeight: 'bold',
		color: COLORS.background,
	},
	modalButtonTextCancel: {
		fontWeight: 'bold',
		color: COLORS.text,
	},
	actionBar: {
		backgroundColor: 'rgba(0,0,0,0.05)',
		padding: 15,
		marginHorizontal: 20,
		marginVertical: 10,
		borderRadius: 10,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	actionBarButton: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		marginHorizontal: 10,
		paddingHorizontal: 18,
		paddingVertical: 12,
		borderRadius: 8,
		flex: 1,
	},
	actionBarText: {
		color: COLORS.background,
		fontSize: 14,
		fontWeight: 'bold',
	},
	addButtonContainer: {
		paddingHorizontal: 20,
		paddingBottom: 10,
	},
	headerLeft: {
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
	headerTitle: {
		gap: 2,
	},
	unsavedIndicator: {
		fontSize: 12,
		color: 'rgba(255,255,255,0.8)',
		fontStyle: 'italic',
	},
	headerRight: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
	},
	headerButton: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 5,
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 20,
		backgroundColor: 'rgba(255,255,255,0.2)',
	},
	headerButtonText: {
		color: COLORS.background,
		fontSize: 12,
		fontWeight: 'bold',
	},
	publishButton: {
		backgroundColor: '#4CAF50',
	},
	publishButtonDisabled: {
		backgroundColor: 'rgba(255,255,255,0.1)',
	},
	discardButton: {
		backgroundColor: '#FF9800',
	},
	uidButton: {
		backgroundColor: '#FF6B6B',
		padding: 15,
		borderRadius: 8,
		alignItems: 'center',
		margin: 20,
		marginBottom: 30,
	},
	uidButtonText: {
		color: '#FFF',
		fontSize: 16,
		fontWeight: 'bold',
	},
	loading: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: COLORS.background,
	},
	// Adicionar ao StyleSheet existente
	inputGroup: {
		marginBottom: 0,
	},
	inputLabel: {
		fontSize: 14,
		fontWeight: 'bold',
		color: COLORS.text,
		marginBottom: 8,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	priceContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		// borderWidth: 1,
		// borderColor: COLORS.border,
		// borderRadius: 10,
		backgroundColor: COLORS.background,
	},
	pricePrefix: {
		fontSize: 32,
		fontWeight: 'bold',
		color: COLORS.primary,
		marginRight: 8
	},
	priceInput: {
		flex: 1,
		fontSize: 42,
		fontWeight: 'bold',
		color: COLORS.text,
	},
});
