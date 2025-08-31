import { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	TouchableOpacity,
	Alert,
	RefreshControl,
	Modal,
	ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useData } from "../../context/DataContext";

const AssignStock = () => {
	const navigation = useNavigation();
	const { deliveryMen, products, refreshData } = useData();
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);

	// 👇 state for modal
	const [modalVisible, setModalVisible] = useState(false);
	const [selectedDeliveryMan, setSelectedDeliveryMan] = useState(null);

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
		try {
			setLoading(true);
			await refreshData();
		} catch (error) {
			console.error("Error fetching data:", error);
			Alert.alert("Error", "Failed to load data. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const onRefresh = async () => {
		setRefreshing(true);
		await fetchData();
		setRefreshing(false);
	};

	const handleAssignToDeliveryMan = (deliveryMan) => {
		navigation.navigate("AssignProduct", { deliveryMan });
	};

	const handleViewProducts = (deliveryMan) => {
		setSelectedDeliveryMan(deliveryMan);
		setModalVisible(true);
	};

	const renderDeliveryMan = ({ item }) => {
		const assignedProductsCount = item.assignedProducts?.length || 0;
		const totalAssignedValue =
			item.assignedProducts?.reduce(
				(sum, product) => sum + product.price * (product.quantity || 0),
				0
			) || 0;

		return (
			<View style={styles.deliveryManCard}>
				<View style={styles.deliveryManInfo}>
					<Text style={styles.deliveryManName}>{item.name}</Text>
					<Text style={styles.deliveryManPhone}>{item.phone}</Text>
					<Text style={styles.deliveryManStats}>
						Assigned Products: {assignedProductsCount} | Value: ₹
						{totalAssignedValue.toLocaleString()}
					</Text>
				</View>

				<View style={styles.actionsContainer}>
					<TouchableOpacity
						style={styles.iconButton}
						onPress={() => handleAssignToDeliveryMan(item)}
					>
						<Ionicons name='cube' size={22} color='#5563EB' />
						<Text style={styles.iconText}>Assign</Text>
					</TouchableOpacity>

					{assignedProductsCount > 0 && (
						<TouchableOpacity
							style={styles.iconButton}
							onPress={() => handleViewProducts(item)}
						>
							<Ionicons name='eye' size={22} color='#10B981' />
							<Text style={styles.iconText}>View</Text>
						</TouchableOpacity>
					)}
				</View>
			</View>
		);
	};

	const renderProductItem = ({ item: p }) => {
		const product = products.find((prod) => prod._id === p.productId);
		const totalValue = p.price * (p.quantity || 0);
		
		return (
			<View style={styles.productCard}>
				<View style={styles.productHeader}>
					<View style={styles.productIconContainer}>
						<Ionicons name="cube-outline" size={24} color="#5563EB" />
					</View>
					<View style={styles.productNameContainer}>
						<Text style={styles.productName}>
							{product?.name || "Unknown Product"}
						</Text>
						<Text style={styles.productDate}>
							Assigned on {new Date(p.assignedAt).toLocaleDateString("en-GB", {
								day: "2-digit",
								month: "short",
								year: "numeric",
							})}
						</Text>
					</View>
					<View style={styles.quantityBadge}>
						<Text style={styles.quantityText}>{p.quantity}</Text>
					</View>
				</View>

				<View style={styles.productDetails}>
					<View style={styles.priceRow}>
						<View style={styles.priceItem}>
							<Text style={styles.priceLabel}>Selling Price</Text>
							<Text style={styles.priceValue}>₹{p.price.toLocaleString()}</Text>
						</View>
						<View style={styles.priceItem}>
							<Text style={styles.priceLabel}>Min Price</Text>
							<Text style={styles.minPriceValue}>₹{p.minPrice.toLocaleString()}</Text>
						</View>
					</View>
					
					<View style={styles.totalValueContainer}>
						<Text style={styles.totalValueLabel}>Total Value</Text>
						<Text style={styles.totalValue}>₹{totalValue.toLocaleString()}</Text>
					</View>
				</View>
			</View>
		);
	};

	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<Text style={styles.loadingText}>Loading delivery men...</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<View style={styles.content}>
				<View style={styles.titleSection}>
					<Text style={styles.pageTitle}>Select Delivery Man</Text>
					<Text style={styles.pageSubtitle}>
						Choose a delivery man to assign products
					</Text>
				</View>

				<FlatList
					data={deliveryMen}
					renderItem={renderDeliveryMan}
					keyExtractor={(item) => item.id}
					contentContainerStyle={styles.listContainer}
					showsVerticalScrollIndicator={false}
					refreshControl={
						<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
					}
					ListEmptyComponent={
						<View style={styles.emptyContainer}>
							<Ionicons name='people' size={48} color='#D1D5DB' />
							<Text style={styles.emptyText}>No delivery men found</Text>
							<Text style={styles.emptySubtext}>
								Add delivery men to start assigning products
							</Text>
						</View>
					}
				/>
			</View>

			{/* 📦 Enhanced Modal for assigned products */}
			<Modal
				animationType='slide'
				visible={modalVisible}
				onRequestClose={() => setModalVisible(false)}
			>
				<View style={styles.modalContainer}>
					{/* Enhanced Modal Header */}
					<View style={styles.modalHeader}>
						<View style={styles.modalHeaderContent}>
							<View style={styles.deliveryManAvatar}>
								<Ionicons name="person" size={24} color="#FFFFFF" />
							</View>
							<View style={styles.modalHeaderText}>
								<Text style={styles.modalTitle}>
									{selectedDeliveryMan?.name}
								</Text>
								<Text style={styles.modalSubtitle}>
									{selectedDeliveryMan?.phone}
								</Text>
							</View>
						</View>
						<TouchableOpacity 
							onPress={() => setModalVisible(false)}
							style={styles.closeButton}
						>
							<Ionicons name='close' size={28} color='#6B7280' />
						</TouchableOpacity>
					</View>

					{/* Summary Cards */}
					<View style={styles.summaryContainer}>
						<View style={styles.summaryCard}>
							<Ionicons name="cube-outline" size={24} color="#5563EB" />
							<Text style={styles.summaryNumber}>
								{selectedDeliveryMan?.assignedProducts?.length || 0}
							</Text>
							<Text style={styles.summaryLabel}>Products</Text>
						</View>
						<View style={styles.summaryCard}>
							<Ionicons name="cash-outline" size={24} color="#10B981" />
							<Text style={styles.summaryNumber}>
								₹{(selectedDeliveryMan?.assignedProducts?.reduce(
									(sum, product) => sum + product.price * (product.quantity || 0),
									0
								) || 0).toLocaleString()}
							</Text>
							<Text style={styles.summaryLabel}>Total Value</Text>
						</View>
					</View>

					{/* Products List */}
					<View style={styles.productsListContainer}>
						<Text style={styles.sectionTitle}>Assigned Products</Text>
						
						{selectedDeliveryMan?.assignedProducts?.length > 0 ? (
							<FlatList
								data={selectedDeliveryMan.assignedProducts}
								renderItem={renderProductItem}
								keyExtractor={(item) => item._id}
								showsVerticalScrollIndicator={false}
								contentContainerStyle={styles.productsList}
							/>
						) : (
							<View style={styles.emptyProductsContainer}>
								<Ionicons name="cube-outline" size={48} color="#D1D5DB" />
								<Text style={styles.emptyProductsText}>No products assigned</Text>
								<Text style={styles.emptyProductsSubtext}>
									This delivery person has no assigned products yet
								</Text>
							</View>
						)}
					</View>
				</View>
			</Modal>
		</View>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#F8FAFC" },
	loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
	loadingText: { fontSize: 16, color: "#6B7280" },
	content: { flex: 1 },
	titleSection: {
		backgroundColor: "#FFF",
		padding: 20,
		borderBottomWidth: 1,
		borderBottomColor: "#E5E7EB",
	},
	pageTitle: { fontSize: 24, fontWeight: "bold", color: "#1F2937" },
	pageSubtitle: { fontSize: 16, color: "#6B7280" },
	listContainer: { padding: 20 },

	deliveryManCard: {
		backgroundColor: "#FFF",
		borderRadius: 12,
		padding: 20,
		marginBottom: 16,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
		borderLeftWidth: 4,
		borderLeftColor: "#5563EB",
	},
	deliveryManInfo: { flex: 1, marginRight: 10 },
	deliveryManName: { fontSize: 18, fontWeight: "600", color: "#1F2937" },
	deliveryManPhone: { fontSize: 14, color: "#5563EB", marginBottom: 6 },
	deliveryManStats: { fontSize: 12, color: "#6B7280" },

	actionsContainer: { flexDirection: "row" },
	iconButton: { alignItems: "center", marginLeft: 12 },
	iconText: { fontSize: 12, marginTop: 2, color: "#4B5563" },

	emptyContainer: { alignItems: "center", paddingVertical: 60 },
	emptyText: { fontSize: 16, color: "#6B7280", marginTop: 10 },
	emptySubtext: { fontSize: 14, color: "#9CA3AF", marginTop: 6 },

	// Enhanced Modal Styles
	modalContainer: { 
		flex: 1, 
		backgroundColor: "#F8FAFC" 
	},
	modalHeader: {
		backgroundColor: "#FFFFFF",
		paddingHorizontal: 20,
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderBottomColor: "#E5E7EB",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	modalHeaderContent: {
		flexDirection: "row",
		alignItems: "center",
		flex: 1,
	},
	deliveryManAvatar: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: "#5563EB",
		justifyContent: "center",
		alignItems: "center",
		marginRight: 12,
	},
	modalHeaderText: {
		flex: 1,
	},
	modalTitle: { 
		fontSize: 20, 
		fontWeight: "700", 
		color: "#1F2937",
		marginBottom: 2,
	},
	modalSubtitle: {
		fontSize: 14,
		color: "#6B7280",
		fontWeight: "500",
	},
	closeButton: {
		padding: 8,
		borderRadius: 20,
		backgroundColor: "#F3F4F6",
	},

	// Summary Cards
	summaryContainer: {
		flexDirection: "row",
		paddingHorizontal: 20,
		paddingVertical: 16,
		gap: 12,
	},
	summaryCard: {
		flex: 1,
		backgroundColor: "#FFFFFF",
		borderRadius: 16,
		padding: 16,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	summaryNumber: {
		fontSize: 20,
		fontWeight: "700",
		color: "#1F2937",
		marginTop: 8,
		marginBottom: 4,
	},
	summaryLabel: {
		fontSize: 12,
		color: "#6B7280",
		fontWeight: "500",
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},

	// Products List Section
	productsListContainer: {
		flex: 1,
		paddingHorizontal: 20,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "700",
		color: "#1F2937",
		marginBottom: 16,
		marginTop: 4,
	},
	productsList: {
		paddingBottom: 20,
	},

	// Enhanced Product Cards
	productCard: {
		backgroundColor: "#FFFFFF",
		borderRadius: 16,
		padding: 16,
		marginBottom: 12,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
		borderLeftWidth: 4,
		borderLeftColor: "#5563EB",
	},
	productHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 12,
	},
	productIconContainer: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: "#EEF2FF",
		justifyContent: "center",
		alignItems: "center",
		marginRight: 12,
	},
	productNameContainer: {
		flex: 1,
	},
	productName: {
		fontSize: 16,
		fontWeight: "600",
		color: "#1F2937",
		marginBottom: 2,
	},
	productDate: {
		fontSize: 12,
		color: "#6B7280",
		fontWeight: "500",
	},
	quantityBadge: {
		backgroundColor: "#5563EB",
		borderRadius: 12,
		paddingHorizontal: 12,
		paddingVertical: 6,
		minWidth: 32,
		alignItems: "center",
	},
	quantityText: {
		color: "#FFFFFF",
		fontSize: 14,
		fontWeight: "600",
	},

	productDetails: {
		borderTopWidth: 1,
		borderTopColor: "#F3F4F6",
		paddingTop: 12,
	},
	priceRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 12,
	},
	priceItem: {
		flex: 1,
		alignItems: "center",
	},
	priceLabel: {
		fontSize: 12,
		color: "#6B7280",
		fontWeight: "500",
		textTransform: "uppercase",
		letterSpacing: 0.5,
		marginBottom: 4,
	},
	priceValue: {
		fontSize: 16,
		fontWeight: "600",
		color: "#10B981",
	},
	minPriceValue: {
		fontSize: 16,
		fontWeight: "600",
		color: "#F59E0B",
	},
	totalValueContainer: {
		backgroundColor: "#F8FAFC",
		borderRadius: 8,
		padding: 12,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		borderWidth: 1,
		borderColor: "#E5E7EB",
	},
	totalValueLabel: {
		fontSize: 14,
		fontWeight: "600",
		color: "#374151",
	},
	totalValue: {
		fontSize: 18,
		fontWeight: "700",
		color: "#1F2937",
	},

	// Empty Products State
	emptyProductsContainer: {
		alignItems: "center",
		paddingVertical: 60,
		paddingHorizontal: 20,
	},
	emptyProductsText: {
		fontSize: 18,
		fontWeight: "600",
		color: "#6B7280",
		marginTop: 16,
		marginBottom: 8,
		textAlign: "center",
	},
	emptyProductsSubtext: {
		fontSize: 14,
		color: "#9CA3AF",
		textAlign: "center",
		lineHeight: 20,
	},
});

export default AssignStock;