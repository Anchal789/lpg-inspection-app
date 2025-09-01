"use client";

import { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	TextInput,
	Alert,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { useData } from "../../context/DataContext";

const AssignProductScreen = () => {
	const route = useRoute();
	const deliveryManFromRoute = (route.params as any)?.deliveryMan;
	const {
		products,
		assignProductToDeliveryMan,
		updateAssignedProduct,
		refreshData,
		deliveryMen,
	} = useData();

	const [productAssignments, setProductAssignments] = useState<
		Record<
			string,
			{
				quantity: string;
				price: string;
				minPrice: string;
				isAssigned: boolean;
				originalQuantity?: number;
				assignedProductId?: string;
			}
		>
	>({});
	const [loading, setLoading] = useState(false);

	// 🔥 FIX: Get fresh delivery man data from context instead of stale route params
	const deliveryMan = deliveryMen?.find(dm => dm._id === deliveryManFromRoute?._id) || deliveryManFromRoute;

	useEffect(() => {
		refreshData();
	}, []);

	useEffect(() => {
		if (products?.length && deliveryMan) {
			const initialAssignments: any = {};

			products.forEach((p: any) => {
				// Check if this product is already assigned to the delivery man
				const assignedProduct = deliveryMan.assignedProducts?.find(
					(ap: any) => ap.productId === p._id
				);

				if (assignedProduct) {
					// Product is already assigned - pre-fill with assigned values
					initialAssignments[p._id] = {
						quantity: String(assignedProduct.quantity),
						price: String(assignedProduct.price),
						minPrice: String(assignedProduct.minPrice),
						isAssigned: true,
						originalQuantity: assignedProduct.quantity,
						assignedProductId: assignedProduct._id,
					};
				} else {
					// Product is not assigned - use default values
					initialAssignments[p._id] = {
						quantity: "",
						price: String(p.price ?? ""),
						minPrice: String(p.minPrice ?? ""),
						isAssigned: false,
					};
				}
			});
			setProductAssignments(initialAssignments);
		}
	}, [products, deliveryMan, deliveryMen]); // This will now trigger when deliveryMen updates

	const updateAssignment = (
		productId: string,
		field: string,
		value: string
	) => {
		setProductAssignments((prev) => ({
			...prev,
			[productId]: {
				...prev[productId],
				[field]: value,
			},
		}));
	};

	// Calculate total assigned quantity across all delivery men
	const getTotalAssignedQuantity = (productId: string) => {
		let totalAssigned = 0;

		if (deliveryMen?.length) {
			deliveryMen.forEach((dm: any) => {
				if (dm.assignedProducts?.length) {
					dm.assignedProducts.forEach((ap: any) => {
						if (ap.productId === productId) {
							totalAssigned += ap.quantity || 0;
						}
					});
				}
			});
		}

		return totalAssigned;
	};

	// Calculate actual available quantity
	const getAvailableQuantity = (product: any, assignment: any) => {
		const totalAssigned = getTotalAssignedQuantity(product._id);

		if (assignment?.isAssigned) {
			// If already assigned, add back the current assignment to show what's available for reassignment
			return (
				product.quantity - totalAssigned + (assignment.originalQuantity || 0)
			);
		}

		// If not assigned, show remaining quantity after all assignments
		return product.quantity - totalAssigned;
	};

	const assignOrUpdateProduct = async (product: any) => {
		const assignment = productAssignments[product._id];
		if (!assignment?.quantity || !assignment?.price || !assignment?.minPrice) {
			Alert.alert("Error", "Please fill all fields for this product");
			return;
		}

		const quantity = parseInt(assignment.quantity);
		const price = parseFloat(assignment.price);
		const name = product.name;
		const minPrice = parseFloat(assignment.minPrice);

		if (quantity <= 0) {
			Alert.alert("Error", "Quantity must be greater than 0");
			return;
		}

		if (price <= 0 || minPrice <= 0) {
			Alert.alert("Error", "Prices must be greater than 0");
			return;
		}

		if (minPrice > price) {
			Alert.alert(
				"Error",
				"Minimum price cannot be greater than selling price"
			);
			return;
		}

		// Calculate available quantity using the corrected method
		const availableQuantity = getAvailableQuantity(product, assignment);

		if (quantity > availableQuantity) {
			Alert.alert("Error", `Only ${availableQuantity} units available`);
			return;
		}

		setLoading(true);
		try {
			if (assignment.isAssigned) {
				// Update existing assignment
				const success = await updateAssignedProduct(
					deliveryMan._id,
					assignment.assignedProductId,
					{
						quantity: quantity,
						price: price,
						minPrice: minPrice,
						originalQuantity: assignment.originalQuantity,
						productId: product._id,
						name: product.name,
					}
				);

				if (success) {
					Alert.alert(
						"Success",
						`${product.name} assignment updated for ${deliveryMan.name}`
					);
				} else {
					Alert.alert(
						"Error",
						"Failed to update product assignment. Please try again."
					);
				}
			} else {
				// Create new assignment
				const assignedProduct = {
					...product,
					quantity: quantity,
					price: price,
					minPrice: minPrice,
					name: product.name,
				};

				const success = await assignProductToDeliveryMan(
					deliveryMan._id,
					assignedProduct
				);

				if (success) {
					Alert.alert(
						"Success",
						`${product.name} assigned to ${deliveryMan.name}`
					);

					// Clear the form fields for newly assigned product
					setProductAssignments((prev) => ({
						...prev,
						[product._id]: {
							...prev[product._id],
							quantity: "",
						},
					}));
				} else {
					Alert.alert("Error", "Failed to assign product. Please try again.");
				}
			}

			// Refresh data to get updated state
			await refreshData();
		} catch (error) {
			console.error("Assign/Update product error:", error);
			Alert.alert("Error", "Failed to process request. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const renderProduct = ({ item }: { item: any }) => {
		const assignment = productAssignments[item._id] || {};
		const availableQuantity = getAvailableQuantity(item, assignment);
		const totalAssigned = getTotalAssignedQuantity(item._id);
		const isAssigned = assignment.isAssigned;

		return (
			<View style={styles.productCard} key={item._id}>
				<View style={styles.productHeader}>
					<Text style={styles.productName}>{item.name}</Text>
					{isAssigned && (
						<View style={styles.assignedBadge}>
							<Text style={styles.assignedBadgeText}>ASSIGNED</Text>
						</View>
					)}
				</View>

				<Text style={styles.productStock}>
					Total Stock: {item.quantity}
					{/* | Available: {availableQuantity} */}
					{totalAssigned > 0 && (
						<Text style={styles.assignedInfo}>
							{" "}
							(Total assigned: {totalAssigned})
						</Text>
					)}
					{/* {isAssigned && (
						<Text style={styles.assignedInfo}>
							{" "}
							| This delivery man: {assignment.originalQuantity}
						</Text>
					)} */}
				</Text>

				<View style={styles.inputContainer}>
					<View style={styles.inputGroup}>
						<Text style={styles.inputLabel}>Quantity</Text>
						<TextInput
							style={styles.input}
							value={assignment.quantity || ""}
							onChangeText={(value) =>
								updateAssignment(item._id, "quantity", value)
							}
							placeholder='0'
							keyboardType='numeric'
						/>
					</View>

					<View style={styles.inputGroup}>
						<Text style={styles.inputLabel}>Price (₹)</Text>
						<TextInput
							style={styles.input}
							value={assignment.price || ""}
							onChangeText={(value) =>
								updateAssignment(item._id, "price", value)
							}
							placeholder='0.00'
							keyboardType='numeric'
						/>
					</View>

					<View style={styles.inputGroup}>
						<Text style={styles.inputLabel}>Min Price (₹)</Text>
						<TextInput
							style={styles.input}
							value={assignment.minPrice || ""}
							onChangeText={(value) =>
								updateAssignment(item._id, "minPrice", value)
							}
							placeholder='0.00'
							keyboardType='numeric'
						/>
					</View>
				</View>

				<TouchableOpacity
					style={[
						styles.assignButton,
						isAssigned && styles.updateButton,
						loading && styles.buttonDisabled,
					]}
					onPress={() => assignOrUpdateProduct(item)}
					disabled={loading}
				>
					<Text style={styles.assignButtonText}>
						{loading
							? isAssigned
								? "Updating..."
								: "Assigning..."
							: isAssigned
							? "Update Assignment"
							: "Assign"}
					</Text>
				</TouchableOpacity>
			</View>
		);
	};

	return (
		<View style={styles.container}>
			<View style={styles.content}>
				<View style={styles.titleSection}>
					<Text style={styles.subtitle}>Assigning to: {deliveryMan?.name}</Text>
				</View>

				<ScrollView
					style={styles.scrollView}
					showsVerticalScrollIndicator={false}
				>
					{products.length === 0 && (
						<Text style={styles.noProductsText}>No products available</Text>
					)}
					{products?.map((product) => renderProduct({ item: product }))}
				</ScrollView>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F8FAFC",
	},
	header: {
		backgroundColor: "#5563EB",
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingTop: 50,
		paddingBottom: 16,
	},
	backButton: {
		padding: 8,
		marginRight: 8,
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: "600",
		color: "#FFFFFF",
	},
	noProductsText: {
		fontSize: 16,
		color: "#6B7280",
		marginTop: 16,
		textAlign: "center",
	},
	content: {
		flex: 1,
	},
	titleSection: {
		paddingHorizontal: 20,
		paddingVertical: 16,
	},
	title: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#1F2937",
	},
	subtitle: {
		fontSize: 14,
		color: "#6B7280",
		marginTop: 4,
	},
	scrollView: {
		flex: 1,
		paddingHorizontal: 20,
	},
	productCard: {
		backgroundColor: "#FFFFFF",
		borderRadius: 12,
		padding: 16,
		marginBottom: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	productHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 4,
	},
	productName: {
		fontSize: 18,
		fontWeight: "600",
		color: "#1F2937",
		flex: 1,
	},
	assignedBadge: {
		backgroundColor: "#10B981",
		paddingHorizontal: 8,
		paddingVertical: 2,
		borderRadius: 4,
	},
	assignedBadgeText: {
		color: "#FFFFFF",
		fontSize: 10,
		fontWeight: "600",
	},
	productStock: {
		fontSize: 14,
		color: "#6B7280",
		marginBottom: 16,
	},
	assignedInfo: {
		color: "#10B981",
		fontWeight: "500",
	},
	inputContainer: {
		flexDirection: "row",
		gap: 12,
		marginBottom: 16,
	},
	inputGroup: {
		flex: 1,
	},
	inputLabel: {
		fontSize: 12,
		fontWeight: "500",
		color: "#374151",
		marginBottom: 4,
	},
	input: {
		borderWidth: 1,
		borderColor: "#D1D5DB",
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 8,
		fontSize: 14,
		backgroundColor: "#F9FAFB",
		color: "#1F2937",
	},
	assignButton: {
		backgroundColor: "#10B981",
		borderRadius: 8,
		paddingVertical: 12,
		alignItems: "center",
	},
	updateButton: {
		backgroundColor: "#3B82F6",
	},
	buttonDisabled: {
		opacity: 0.6,
	},
	assignButtonText: {
		color: "#FFFFFF",
		fontSize: 14,
		fontWeight: "600",
	},
});

export default AssignProductScreen;
