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
	const deliveryMan = (route.params as any)?.deliveryMan;
	const { products, assignProductToDeliveryMan, refreshData } = useData();

	const [productAssignments, setProductAssignments] = useState<
		Record<
			string,
			{
				quantity: string;
				price: string;
				minPrice: string;
			}
		>
	>({});
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		refreshData();
	}, []);

	useEffect(() => {
		if (products?.length) {
			const initialAssignments: any = {};
			products.forEach((p: any) => {
				initialAssignments[p._id] = {
					quantity: String(p.quantity ?? ""),
					price: String(p.price ?? ""),
					minPrice: String(p.minPrice ?? ""),
				};
			});
			setProductAssignments(initialAssignments);
		}
	}, [products]);

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

	const assignProduct = async (product: any) => {
		const assignment = productAssignments[product._id];
		if (!assignment?.quantity || !assignment?.price || !assignment?.minPrice) {
			Alert.alert("Error", "Please fill all fields for this product");
			return;
		}

		const quantity = parseInt(assignment.quantity);
		const price = parseFloat(assignment.price);
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

		if (quantity > product.quantity) {
			Alert.alert("Error", `Only ${product.quantity} units available in stock`);
			return;
		}

		setLoading(true);
		try {
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

				// Clear the assignment
				setProductAssignments((prev) => {
					const newState = { ...prev };
					delete newState[product.id];
					return newState;
				});
			} else {
				Alert.alert("Error", "Failed to assign product. Please try again.");
			}
		} catch (error) {
			console.error("Assign product error:", error);
			Alert.alert("Error", "Failed to assign product. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const renderProduct = ({ item }: { item: any }) => {
		const assignment = productAssignments[item._id] || {};

		return (
			<View style={styles.productCard} key={item._id}>
				<Text style={styles.productName}>{item.name}</Text>
				<Text style={styles.productStock}>
					Available Stock: {item.quantity}
				</Text>

				<View style={styles.inputContainer}>
					<View style={styles.inputGroup}>
						<Text style={styles.inputLabel}>Quantity</Text>
						<TextInput
							style={styles.input}
							value={assignment.quantity}
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
							value={assignment.price}
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
							value={assignment.minPrice}
							onChangeText={(value) =>
								updateAssignment(item._id, "minPrice", value)
							}
							placeholder='0.00'
							keyboardType='numeric'
						/>
					</View>
				</View>

				<TouchableOpacity
					style={[styles.assignButton, loading && styles.buttonDisabled]}
					onPress={() => assignProduct(item)}
					disabled={loading}
				>
					<Text style={styles.assignButtonText}>
						{loading ? "Assigning..." : "Assign"}
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
	productName: {
		fontSize: 18,
		fontWeight: "600",
		color: "#1F2937",
		marginBottom: 4,
	},
	productStock: {
		fontSize: 14,
		color: "#6B7280",
		marginBottom: 16,
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
