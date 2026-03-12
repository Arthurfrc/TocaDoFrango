// src/screens/AdminScreen.tsx

import React, { useEffect, useState } from 'react';
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	TextInput,
	Modal,
	KeyboardAvoidingView,
	Platform,
	Alert
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { COLORS } from '@/constants/colors';
import { Product, Category } from '@/types';
import { getCategoryName } from '@/utils';
import { useMenu } from '@/context/MenuContext';
import { menuService } from '@/services/menuService';
import { configService } from '@/services/configService';

import CustomAlert from '@/components/CustomAlert';
import CustomModal from '@/components/CustomModal';
import CustomFormModal from '@/components/CustomFormModal';
import CustomProductModal from '@/components/CustomProductModal';

import { adminNumber } from '@/utils/whatsapp';

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
		categories,
		addCategory,
		updateCategory,
		deleteCategory
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

	const [showCategoryModal, setShowCategoryModal] = useState(false);
	const [categoryName, setCategoryName] = useState('');
	const [editingCategory, setEditingCategory] = useState<Category | null>(null);

	const [selectedProductForCategory, setSelectedProductForCategory] = useState<Product | null>(null);
	const [selectedCategoryId, setSelectedCategoryId] = useState('');
	const [showCategorySelector, setShowCategorySelector] = useState(false);

	const [showSettingsModal, setShowSettingsModal] = useState(false);
	const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
	const [adminWhatsApp, setAdminWhatsApp] = useState('');
	const [adminInputNumber, setAdminInputNumber] = useState('');

	// Estados para expansão
	const [categoriesExpanded, setCategoriesExpanded] = useState(true);
	const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

	const openEditModal = (product?: Product, categoryId?: string) => {
		setEditingProduct(product || null);
		setSelectedCategoryId(product?.categoryId || categoryId || '');
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

	const handleDeleteProduct = (productId: string) => {
		showAlert(
			'🗑️ Confirmar Exclusão',
			'Tem certeza que deseja excluir este produto?',
			() => {
				deleteProduct(productId);
			},
			() => { },
			'Confirmar',
			'Cancelar'
		);
	};

	const settingsOptions = [
		{
			id: 'whatsapp',
			title: '📱 WhatsApp Admin',
			onPress: () => setShowWhatsAppModal(true)
		},
		{
			id: 'privacy',
			title: '📄 Política de Privacidade',
			onPress: () => navigation.navigate('PrivacyPolicy')
		},
		{
			id: 'terms',
			title: '📋 Termos de Serviço',
			onPress: () => navigation.navigate('TermsOfService')
		}
	];

	const handleDeleteCategory = (categoryId: string) => {
		const categoryProducts = products.filter(p => p.categoryId === categoryId);

		showAlert(
			'🗑️ Confirmar Exclusão',
			categoryProducts.length > 0
				? `Atenção! Esta categoria contém ${categoryProducts.length} produto(s). Todos serão excluídos. Deseja continuar?`
				: 'Tem certeza que deseja excluir esta categoria?',
			() => {
				// Excluir todos os produtos da categoria primeiro
				categoryProducts.forEach(product => {
					deleteProduct(product.id);
				});
				// Depois excluir a categoria
				deleteCategory(categoryId);
			},
			() => { },
			'Confirmar',
			'Cancelar'
		);
	};

	const toggleCategoryExpansion = (categoryId: string) => {
		setExpandedCategory(prev => prev === categoryId ? null : categoryId);
	};

	const loadAdminWhatsApp = async () => {
		try {
			const config = await configService.getConfig();
			setAdminWhatsApp(config.whatsappNumber);
		} catch (error) {
			console.error('Erro ao carregar WhatsApp:', error);
			setAdminWhatsApp('');
		}
	};

	const formatWhatsApp = (value: string) => {
		// Remove todos os caracteres não numéricos
		const cleanValue = value.replace(/\D/g, '');

		// Limita a 11 dígitos (DDD + 9 dígitos)
		const limitedValue = cleanValue.slice(0, 11);

		// Aplica formatação (XX) XXXXX-XXXX
		if (limitedValue.length <= 2) {
			return limitedValue;
		} else if (limitedValue.length <= 7) {
			return `(${limitedValue.slice(0, 2)}) ${limitedValue.slice(2)}`;
		} else {
			return `(${limitedValue.slice(0, 2)}) ${limitedValue.slice(2, 7)}-${limitedValue.slice(7)}`;
		}
	};

	const getDisplayWhatsApp = () => {
		if (!adminWhatsApp) return '';
		// Remove o +55 para exibir no input
		const without55 = adminWhatsApp.startsWith('55') ? adminWhatsApp.substring(2) : adminWhatsApp;
		return formatWhatsApp(without55);
	};

	const saveAdminWhatsApp = async (newNumber: string) => {
		try {
			// Remove caracteres não numéricos e formatação
			const cleanNumber = newNumber.replace(/\D/g, '');
			// Adiciona +55 se não começar com 55
			const fullNumber = cleanNumber.startsWith('55') ? cleanNumber : `55${cleanNumber}`;

			await configService.saveWhatsAppNumber(fullNumber);
			setAdminWhatsApp(fullNumber);
		} catch (error) {
			console.error('Erro ao salvar WhatsApp:', error);
			Alert.alert('Erro', 'Não foi possível salvar o número do WhatsApp');
		}

	};

	useEffect(() => {
		loadAdminWhatsApp();
	}, []);

	useEffect(() => {
		const unsubscribe = navigation.addListener('focus', () => {
			loadAdminWhatsApp();
		});

		return unsubscribe;
	}, [navigation]);

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
				<TouchableOpacity
					style={styles.whatsappButton}
					onPress={() => {
						setAdminInputNumber(getDisplayWhatsApp());
						setShowWhatsAppModal(true);
					}}
				>
					<FontAwesome5 name="phone" size={24} color={COLORS.background} />
				</TouchableOpacity>
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
				{/* Header Principal de Categorias */}
				<View style={styles.sectionContainer}>
					<TouchableOpacity
						style={styles.sectionHeader}
						onPress={() => setCategoriesExpanded(!categoriesExpanded)}
					>
						<View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
							<FontAwesome5
								name={categoriesExpanded ? "chevron-down" : "chevron-right"}
								size={16}
								color={COLORS.text}
								style={{ marginRight: 10 }}
							/>
							<Text style={styles.sectionTitle}>📂 Categorias</Text>
						</View>
						<TouchableOpacity
							style={styles.addCategoryButton}
							onPress={() => setShowCategoryModal(true)}
						>
							<FontAwesome5 name="plus" size={16} color={COLORS.background} />
						</TouchableOpacity>
					</TouchableOpacity>

					{/* Categorias com Produtos Aninhados */}
					{categoriesExpanded && (
						<>
							{categories.length === 0 ? (
								<View style={styles.emptyContainer}>
									<Text style={styles.emptyText}>Nenhuma categoria cadastrada</Text>
									<Text style={styles.emptySubtext}>Adicione categorias para organizar seus produtos</Text>
								</View>
							) : (
								categories.map((category) => {
									const categoryProducts = products.filter(p => p.categoryId === category.id);
									const isExpanded = expandedCategory === category.id;

									return (
										<View key={category.id} style={styles.categoryContainer}>
											{/* Header da Categoria */}
											<TouchableOpacity
												style={styles.categoryHeader}
												onPress={() => toggleCategoryExpansion(category.id)}
											>
												<View style={styles.categoryContent}>
													<View style={styles.categoryNameRow}>
														<FontAwesome5
															name={isExpanded ? "chevron-down" : "chevron-right"}
															size={16}
															color={COLORS.text}
															style={{ marginRight: 10 }}
														/>
														<Text style={styles.categoryName}>{category.name}</Text>
													</View>
													<View style={styles.categoryActionsRow}>
														<Text style={styles.categoryCount}>
															({categoryProducts.length} produtos)
														</Text>
														<View style={styles.categoryActions}>
															<TouchableOpacity
																style={styles.actionButton}
																onPress={() => {
																	setEditingCategory(category);
																	setCategoryName(category.name);
																	setShowCategoryModal(true);
																}}
															>
																<FontAwesome5 name="edit" size={16} color={COLORS.admin} />
															</TouchableOpacity>

															<TouchableOpacity
																style={styles.actionButton}
																onPress={() => handleDeleteCategory(category.id)}
															>
																<FontAwesome5 name="trash" size={16} color="#FF5252" />
															</TouchableOpacity>

															<TouchableOpacity
																style={styles.actionButton}
																onPress={() => openEditModal(undefined, category.id)}
															>
																<FontAwesome5 name="plus" size={16} color={COLORS.admin} />
															</TouchableOpacity>
														</View>
													</View>
												</View>
											</TouchableOpacity>

											{/* Produtos da Categoria (se expandido) */}
											{isExpanded && (
												<View style={styles.productsList}>
													{categoryProducts.length === 0 ? (
														<View style={styles.emptySubContainer}>
															<Text style={styles.emptySubtext}>Nenhum produto nesta categoria</Text>
														</View>
													) : (
														categoryProducts.map(product => (
															<View key={product.id} style={styles.productCard}>
																<View style={styles.productInfo}>
																	<Text style={styles.productName}>{product.name}</Text>
																	<Text style={styles.productDescription}>{product.description}</Text>
																	<Text style={styles.productPrice}>R$ {product.price.toFixed(2)}</Text>
																	{product.hasStockControl && (
																		<Text style={styles.stockInfo}>
																			Estoque: {product.stock || 0} unidades
																		</Text>
																	)}
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
																		<FontAwesome5 name="edit" size={16} color="black" />
																	</TouchableOpacity>

																	<TouchableOpacity
																		style={[styles.actionButton, styles.toggleButton]}
																		onPress={() => toggleProductAvailability(product.id)}
																	>
																		<FontAwesome5
																			name={product.available ? "eye-slash" : "eye"}
																			size={16}
																			color="black"
																		/>
																	</TouchableOpacity>

																	<TouchableOpacity
																		style={[styles.actionButton, styles.deleteButton]}
																		onPress={() => handleDeleteProduct(product.id)}
																	>
																		<FontAwesome5 name="trash" size={16} color="black" />
																	</TouchableOpacity>
																</View>
															</View>
														))
													)}
												</View>
											)}
										</View>
									);
								})
							)}
						</>
					)}
				</View>
			</ScrollView>

			{/* Modal de Nova Categoria */}
			<CustomFormModal
				visible={showCategoryModal}
				title={editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
				fieldLabel="Nome da Categoria"
				fieldValue={categoryName}
				fieldPlaceholder="Ex: Lanches, Bebidas, Sobremesas"
				onFieldChange={setCategoryName}
				onSave={() => {
					if (!categoryName.trim()) {
						Alert.alert('Erro', 'Digite um nome para a categoria');
						return;
					}

					if (editingCategory) {
						const updatedCategory: Category = {
							...editingCategory,
							name: categoryName.trim(),
							updatedAt: new Date(),
						};
						updateCategory(editingCategory.id, updatedCategory);
					} else {
						const newCategory: Category = {
							id: Date.now().toString(),
							name: categoryName.trim(),
							createdAt: new Date(),
							updatedAt: new Date(),
						};
						addCategory(newCategory);
					}

					setShowCategoryModal(false);
					setCategoryName('');
					setEditingCategory(null);
				}}
				onCancel={() => {
					setShowCategoryModal(false);
					setCategoryName('');
					setEditingCategory(null);
				}}
				icon="📂"
			/>

			{/* Modal de Seleção de Categoria */}
			<Modal
				visible={showCategorySelector}
				transparent={true}
				animationType="fade"
				onRequestClose={() => setShowCategorySelector(false)}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>Selecione uma Categoria</Text>

						{categories.length === 0 ? (
							<View style={styles.emptyContainer}>
								<Text style={styles.emptyText}>Nenhuma categoria cadastrada</Text>
								<Text style={styles.emptySubtext}>Crie categorias primeiro</Text>
							</View>
						) : (
							categories.map((category) => (
								<TouchableOpacity
									key={category.id}
									style={styles.categoryOption}
									onPress={() => {
										setSelectedCategoryId(category.id);
										setShowCategorySelector(false);
										setSelectedProductForCategory(null);
									}}
								>
									<Text style={styles.categoryOptionText}>{category.name}</Text>
								</TouchableOpacity>
							))
						)}

						<TouchableOpacity
							style={[styles.modalButton, styles.cancelButton]}
							onPress={() => {
								setShowCategorySelector(false);
								setSelectedProductForCategory(null);
							}}
						>
							<Text style={styles.modalButtonTextCancel}>Cancelar</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>

			{/* Modal de Produto */}
			<CustomProductModal
				visible={modalVisible}
				product={editingProduct}
				onSave={(product) => {
					if (editingProduct) {
						updateProduct(editingProduct.id, product);
					} else {
						addProduct(product);
					}
					setModalVisible(false);
					setEditingProduct(null);
				}}
				onCancel={() => {
					setModalVisible(false);
					setEditingProduct(null);
				}}
				categories={categories}
				onCategorySelect={() => setShowCategorySelector(true)}
				selectedCategoryId={selectedCategoryId}
			/>
			<CustomAlert
				visible={alertVisible}
				title={alertConfig.title}
				message={alertConfig.message}
				onConfirm={alertConfig.onConfirm}
				onCancel={alertConfig.onCancel}
				confirmText={alertConfig.confirmText}
				cancelText={alertConfig.cancelText}
			/>

			<CustomModal
				visible={showSettingsModal}
				title="⚙️ Configurações"
				options={settingsOptions}
				onClose={() => setShowSettingsModal(false)}
			/>
			<CustomFormModal
				visible={showWhatsAppModal}
				title="Configurar WhatsApp"
				fieldLabel="📱Número do WhatsApp"
				fieldValue={adminInputNumber}
				fieldPlaceholder="(84) 99876-5432"
				onFieldChange={(value) => {
					const formatted = formatWhatsApp(value);
					setAdminInputNumber(formatted);
				}}
				onSave={() => {
					saveAdminWhatsApp(adminInputNumber);
					setAdminInputNumber('');
					setShowWhatsAppModal(false);
				}}
				onCancel={() => {
					setAdminInputNumber('');
					setShowWhatsAppModal(false);
				}}
				saveButtonText="Salvar"
				keyboardType="phone-pad"
				maxLength={15}
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
	whatsappButton: {
		padding: 8,
		backgroundColor: 'rgba(255,255,255,0.2)',
		borderRadius: 20,
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		color: COLORS.background,
	},
	content: {
		flex: 1,
		padding: 20,
	},
	loading: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: COLORS.background,
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
	headerRight: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	settingsButton: {
		backgroundColor: '#4A90E2',
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
	sectionContainer: {
		marginBottom: 30,
		paddingTop: 5,
	},
	sectionHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 15,
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		color: COLORS.text,
	},
	addCategoryButton: {
		backgroundColor: COLORS.primary,
		width: 32,
		height: 32,
		borderRadius: 16,
		justifyContent: 'center',
		alignItems: 'center',
	},
	emptyContainer: {
		alignItems: 'center',
		padding: 30,
		backgroundColor: '#f5f5f5',
		borderRadius: 10,
	},
	emptyText: {
		fontSize: 16,
		color: COLORS.text,
		marginBottom: 5,
	},
	emptySubtext: {
		fontSize: 14,
		color: '#666',
		textAlign: 'center',
	},
	emptySubContainer: {
		alignItems: 'center',
		padding: 20,
		backgroundColor: '#f9f9f9',
		borderRadius: 8,
		marginLeft: 20,
		marginTop: 5,
	},
	categoryContainer: {
		marginBottom: 15,
	},
	categoryHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		backgroundColor: '#EEE',
		borderColor: '#E9ECEF',
		padding: 15,
		borderRadius: 10,
		marginBottom: 5,
		elevation: 2,
	},
	categoryName: {
		fontSize: 18,
		fontWeight: 'bold',
		color: COLORS.text,
	},
	categoryCount: {
		fontSize: 12,
		color: '#666',
		marginLeft: 8,
	},
	categoryActions: {
		flexDirection: 'row',
		gap: 8,
	},
	actionButton: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: '#f5f5f5',
		justifyContent: 'center',
		alignItems: 'center',
	},
	productsList: {
		paddingLeft: 20,
	},
	productCard: {
		backgroundColor: '#FFF',
		padding: 15,
		marginBottom: 5,
		borderRadius: 10,
		elevation: 2,
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	productInfo: {
		flex: 1,
	},
	productName: {
		fontSize: 16,
		fontWeight: 'bold',
		color: COLORS.text,
		marginBottom: 3,
	},
	productDescription: {
		fontSize: 12,
		color: '#666',
		marginBottom: 3,
	},
	productPrice: {
		fontSize: 14,
		fontWeight: 'bold',
		color: COLORS.primary,
		marginBottom: 3,
	},
	stockInfo: {
		fontSize: 10,
		color: '#666',
		fontStyle: 'italic',
		marginTop: 2,
	},
	statusContainer: {
		marginTop: 3,
	},
	statusText: {
		fontSize: 10,
		color: COLORS.text,
	},
	actions: {
		flexDirection: 'row',
		gap: 5,
	},
	editButton: {
		backgroundColor: '#FFF',
	},
	toggleButton: {
		backgroundColor: '#FFF',
	},
	deleteButton: {
		backgroundColor: '#FFF',
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.5)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	input: {
		width: '100%',
		height: 50,
		backgroundColor: '#FFF',
		borderRadius: 10,
		paddingHorizontal: 15,
		fontSize: 16,
		borderWidth: 1,
		borderColor: '#DDD',
		marginBottom: 20,
	},
	saveButton: {
		backgroundColor: COLORS.primary,
		paddingHorizontal: 30,
		paddingVertical: 12,
		borderRadius: 25,
	},
	saveButtonText: {
		color: '#FFF',
		fontSize: 16,
		fontWeight: 'bold',
	},
	modalContent: {
		backgroundColor: COLORS.background,
		paddingHorizontal: 30,
		paddingVertical: 20,
		borderRadius: 20,
		width: '90%',
		maxHeight: '80%',
	},
	modalContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0,0,0,0.5)',
		padding: 20,
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		color: COLORS.primary,
		marginBottom: 20,
		textAlign: 'center',
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
	modalButtonTextCancel: {
		fontWeight: 'bold',
		color: COLORS.text,
	},
	categoryOption: {
		padding: 15,
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
	},
	categoryOptionText: {
		fontSize: 16,
		color: COLORS.text,
	},
	categoryContent: {
		flex: 1,
	},
	categoryNameRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 5,
	},
	categoryActionsRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	syncButton: {
		backgroundColor: COLORS.admin,
		marginLeft: 10,
	},
});