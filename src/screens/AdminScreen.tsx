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
	Platform,
	Alert
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

import { COLORS } from '@/constants/colors';
import { Product, Category } from '@/types';
import { getCategoryName } from '@/utils';
import { useMenu } from '@/context/MenuContext';

import CustomAlert from '@/components/CustomAlert';
import CustomModal from '@/components/CustomModal';
import CustomFormModal from '@/components/CustomFormModal';
import CustomProductModal from '@/components/CustomProductModal';

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

	const [showOptionsModal, setShowOptionsModal] = useState(false);
	const [showCategoryModal, setShowCategoryModal] = useState(false);
	const [categoryName, setCategoryName] = useState('');
	const [editingCategory, setEditingCategory] = useState<Category | null>(null);

	const [categoriesExpanded, setCategoriesExpanded] = useState(true);
	const [showCategorySelector, setShowCategorySelector] = useState(false);
	const [selectedProductForCategory, setSelectedProductForCategory] = useState<Product | null>(null);
	const [selectedCategoryId, setSelectedCategoryId] = useState('');

	const openEditModal = (product?: Product) => {
		setEditingProduct(product || null);
		setSelectedCategoryId(product?.categoryId || '');
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
				// Não precisa de alert aqui, a ação já foi executada
			},
			() => { }, // Só fecha
			'Confirmar',
			'Cancelar'
		);
	};

	// Agrupar produtos por categoria
	const groupedProducts = products.reduce((acc, product) => {
		const category = getCategoryName(product, categories);
		if (!acc[category]) acc[category] = [];
		acc[category].push(product);
		return acc;
	}, {} as Record<string, Product[]>);

	const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

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

			<ScrollView style={[styles.content, { maxHeight: 250 }]}>
				{/* Seção de Categorias */}
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

					{categories.length === 0 ? (
						<View style={styles.emptyContainer}>
							<Text style={styles.emptyText}>Nenhuma categoria cadastrada</Text>
							<Text style={styles.emptySubtext}>Adicione categorias para organizar seus produtos</Text>
						</View>
					) : (
						categories.map((category) => (
							<View key={category.id} style={styles.categoryCard}>
								<View style={styles.categoryInfo}>
									<Text style={styles.categoryName}>{category.name}</Text>
									<Text style={styles.categoryDate}>
										Criada em {
											(category.createdAt as any)?.toDate?.()?.toLocaleDateString('pt-BR') ||
											(category.createdAt ? new Date(category.createdAt).toLocaleDateString('pt-BR') : 'Data não disponível')
										}
									</Text>
								</View>
								<View style={styles.categoryActions}>
									<TouchableOpacity
										style={styles.editButton}
										onPress={() => {
											setEditingCategory(category);
											setCategoryName(category.name);
											setShowCategoryModal(true);
										}}
									>
										<FontAwesome5 name="edit" size={16} color={COLORS.primary} />
									</TouchableOpacity>
									<TouchableOpacity
										style={styles.deleteButton}
										onPress={() => {
											Alert.alert(
												'Confirmar Exclusão',
												`Deseja excluir a categoria "${category.name}"?`,
												[
													{ text: 'Cancelar', style: 'cancel' },
													{
														text: 'Excluir',
														style: 'destructive',
														onPress: () => deleteCategory(category.id),
													},
												]
											);
										}}
									>
										<FontAwesome5 name="trash" size={16} color="#FF5252" />
									</TouchableOpacity>
								</View>
							</View>
						))
					)}
				</View>
			</ScrollView>

			{/* Seção de Produtos */}

			<ScrollView style={[styles.content, { marginBottom: 40, borderTopWidth: 1, borderTopColor: COLORS.text, borderStyle: 'solid', marginTop: 5 }]}>
				<View style={styles.sectionContainer}>
					<View style={styles.sectionHeader}>
						<Text style={styles.sectionTitle}>🍔 Produtos</Text>
						<TouchableOpacity
							style={styles.addCategoryButton}
							onPress={() => openEditModal()}
						>
							<FontAwesome5 name="plus" size={16} color={COLORS.background} />
						</TouchableOpacity>
					</View>
					{products.length === 0 ? (
						<View style={styles.emptyContainer}>
							<FontAwesome5 name="box-open" size={48} color={COLORS.primary} />
							<Text style={styles.emptyText}>
								Nenhum produto cadastrado. Adicione produtos para começar!
							</Text>
						</View>
					) :

						(Object.entries(groupedProducts)
							.sort(([a], [b]) => a.localeCompare(b))
							.map(([category, categoryProducts]) => {
								const isExpanded = expandedCategories.has(category);
								const sortedProducts = categoryProducts.sort((a, b) => a.name.localeCompare(b.name));

								return (
									<View key={category} style={styles.categoryContainer}>
										<TouchableOpacity
											style={[styles.categoryHeader, isExpanded && { marginBottom: 5 }]}
											onPress={() => {
												const newExpanded = new Set(expandedCategories);
												if (isExpanded) {
													newExpanded.delete(category);
												} else {
													newExpanded.add(category);
												}
												setExpandedCategories(newExpanded);
											}}
										>
											<Text style={styles.categoryCardName}>{category}</Text>
											<FontAwesome5
												name={isExpanded ? "chevron-down" : "chevron-right"}
												size={16}
												color={COLORS.text}
											/>
										</TouchableOpacity>

										{isExpanded && (
											<View style={styles.productsList}>
												{sortedProducts.map(product => (
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
												))}
											</View>
										)}
									</View>
								);
							})
						)}
				</View>
			</ScrollView>

			{/* Modal de opções */}
			<CustomModal
				visible={showOptionsModal}
				title="O que você deseja adicionar?"
				options={[
					{
						id: 'product',
						title: 'Novo Produto',
						icon: '🍔',
						onPress: () => openEditModal(),
					},
					{
						id: 'category',
						title: 'Nova Categoria',
						icon: '📂',
						onPress: () => {
							setShowCategoryModal(true);
						},
					},
				]}
				onClose={() => setShowOptionsModal(false)}
			/>

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
						// Editando categoria existente
						const updatedCategory: Category = {
							...editingCategory,
							name: categoryName.trim(),
							updatedAt: new Date(),
						};
						updateCategory(editingCategory.id, updatedCategory);
					} else {
						// Criando nova categoria
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
		paddingHorizontal: 10,
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
		marginBottom: 0
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
		fontSize: 18,
		fontWeight: 'bold',
		color: COLORS.text,
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
		backgroundColor: COLORS.background//'#4CAF50',
	},
	toggleButton: {
		backgroundColor: COLORS.background//'#2196f3',
	},
	deleteButton: {
		backgroundColor: COLORS.background//'#FF5252',
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
	checkboxContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 15,
	},
	checkbox: {
		marginRight: 10,
	},
	checkboxLabel: {
		fontSize: 16,
		color: COLORS.text,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	stockInfo: {
		fontSize: 12,
		color: '#666',
		fontStyle: 'italic',
		marginTop: 2,
	},
	stockInputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
	},
	stockInput: {
		flex: 1,
		textAlign: 'center',
	},
	stockButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: COLORS.background,
		borderWidth: 1,
		borderColor: COLORS.primary,
		justifyContent: 'center',
		alignItems: 'center',
	},
	categoryContainer: {
		marginBottom: 15,
	},
	categoryHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		backgroundColor: COLORS.background,
		padding: 15,
		borderRadius: 10,
		marginBottom: 0,
		elevation: 2,
	},
	categoryName: {
		fontSize: 18,
		fontWeight: 'bold',
		color: COLORS.text,
	},
	productsList: {
		paddingLeft: 10,
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
	categoryCard: {
		backgroundColor: '#FFF',
		padding: 15,
		marginBottom: 10,
		borderRadius: 10,
		elevation: 2,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	categoryInfo: {
		flex: 1,
	},
	categoryCardName: {
		fontSize: 16,
		fontWeight: 'bold',
		color: COLORS.text,
	},
	categoryDate: {
		fontSize: 12,
		color: '#666',
		marginTop: 2,
	},
	categoryActions: {
		flexDirection: 'row',
		gap: 10,
	},
	categorySelector: {
		borderWidth: 1,
		borderColor: '#ddd',
		borderRadius: 8,
		padding: 12,
		backgroundColor: '#fff',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	categorySelectorText: {
		fontSize: 16,
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
});
