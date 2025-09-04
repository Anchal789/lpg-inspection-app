import { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	TouchableOpacity,
	Alert,
	RefreshControl,
	ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useData } from "../../context/DataContext";
import LoadingIndicator from "../../components/Loader";

const DeliveryManManagement = () => {
	const navigation = useNavigation();
	const { deliveryMen, refreshData, toggleDeliveryManStatus } = useData();
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [togglingStatus, setTogglingStatus] = useState<string | null>(null);

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

	const toggleDeliveryManStatusFunction = async (deliveryMan: any) => {
		const action = deliveryMan.isActive ? "deactivate" : "activate";
		const actionTitle = deliveryMan.isActive ? "Deactivate" : "Activate";

		Alert.alert(
			`${actionTitle} Delivery Man`,
			`Are you sure you want to ${action} ${deliveryMan.name}?`,
			[
				{
					text: "Cancel",
					style: "cancel",
				},
				{
					text: actionTitle,
					style: deliveryMan.isActive ? "destructive" : "default",
					onPress: async () => {
						try {
							setTogglingStatus(deliveryMan._id);

							// Replace this with your actual API call
							const success = await toggleDeliveryManStatus(deliveryMan._id);

							if (success) {
								Alert.alert(
									"Success",
									`${deliveryMan.name} has been ${action}d successfully.`
								);
								await refreshData(); // Refresh the list
							} else {
								throw new Error("Failed to update status");
							}
						} catch (error) {
							console.error(`Error ${action}ing delivery man:`, error);
							Alert.alert(
								"Error",
								`Failed to ${action} ${deliveryMan.name}. Please try again.`
							);
						} finally {
							setTogglingStatus(null);
						}
					},
				},
			]
		);
	};

	const renderDeliveryMan = ({ item }: { item: any }) => {
		const assignedProductsCount = item.assignedProducts?.length || 0;
		const totalAssignedValue =
			item.assignedProducts?.reduce(
				(sum: number, product: any) =>
					sum + product.price * (product.quantity || 0),
				0
			) || 0;

		const isToggling = togglingStatus === item._id;

		return (
			<View
				style={[styles.deliveryManCard, !item.isActive && styles.inactiveCard]}
			>
				<View style={styles.deliveryManInfo}>
					<View style={styles.nameContainer}>
						<Text
							style={[
								styles.deliveryManName,
								!item.isActive && styles.inactiveText,
							]}
						>
							{item.name}
						</Text>
						<View
							style={[
								styles.statusBadge,
								item.isActive ? styles.activeBadge : styles.inactiveBadge,
							]}
						>
							<Text
								style={[
									styles.statusText,
									item.isActive
										? styles.activeStatusText
										: styles.inactiveStatusText,
								]}
							>
								{item.isActive ? "Active" : "Inactive"}
							</Text>
						</View>
					</View>

					<Text
						style={[
							styles.deliveryManPhone,
							!item.isActive && styles.inactiveText,
						]}
					>
						{item.phone}
					</Text>

					<Text
						style={[
							styles.deliveryManStats,
							!item.isActive && styles.inactiveText,
						]}
					>
						Assigned Products: {assignedProductsCount} | Value: ₹
						{totalAssignedValue.toLocaleString()}
					</Text>

					{item.distributorId && (
						<Text
							style={[
								styles.distributorText,
								!item.isActive && styles.inactiveText,
							]}
						>
							{item.distributorId.agencyName}
						</Text>
					)}
				</View>

				<View style={styles.actionsContainer}>
					<TouchableOpacity
						style={[
							styles.statusButton,
							item.isActive ? styles.deactivateButton : styles.activateButton,
						]}
						onPress={() => toggleDeliveryManStatusFunction(item)}
						disabled={isToggling}
					>
						{isToggling ? (
							<ActivityIndicator size='small' color='#FFF' />
						) : (
							<>
								<Ionicons
									name={item.isActive ? "close-circle" : "checkmark-circle"}
									size={20}
									color='#FFF'
								/>
								<Text style={styles.statusButtonText}>
									{item.isActive ? "Deactivate" : "Activate"}
								</Text>
							</>
						)}
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.iconButton}
						onPress={() =>
						{
							navigation.navigate(
								"DeliveryManDetails" as never,
								{ deliveryMan: item } as never
							)
						}
						}
					>
						<Ionicons name='eye' size={22} color='#5563EB' />
						<Text style={styles.iconText}>View</Text>
					</TouchableOpacity>
				</View>
			</View>
		);
	};

	if (loading) {
		return (
			<View>
				<LoadingIndicator />
			</View>
		);
	}

	const activeDeliveryMen = deliveryMen.filter((dm: any) => dm.isActive);
	const inactiveDeliveryMen = deliveryMen.filter((dm: any) => !dm.isActive);

	return (
		<View style={styles.container}>
			<View style={styles.content}>
				<View style={styles.titleSection}>
					<Text style={styles.pageTitle}>Delivery Men Management</Text>
					<View style={styles.statsContainer}>
						<Text style={styles.statsText}>
							Total: {deliveryMen.length} | Active: {activeDeliveryMen.length} |
							Inactive: {inactiveDeliveryMen.length}
						</Text>
					</View>
				</View>

				<FlatList
					data={deliveryMen}
					renderItem={renderDeliveryMan}
					keyExtractor={(item) => item._id}
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
								Add delivery men to start managing them
							</Text>
						</View>
					}
				/>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#F8FAFC" },
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#F8FAFC",
	},
	loadingText: {
		fontSize: 16,
		color: "#6B7280",
		marginTop: 10,
	},
	content: { flex: 1 },
	titleSection: {
		backgroundColor: "#FFF",
		padding: 20,
		borderBottomWidth: 1,
		borderBottomColor: "#E5E7EB",
	},
	pageTitle: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#1F2937",
		marginBottom: 8,
	},
	statsContainer: {
		backgroundColor: "#F3F4F6",
		padding: 12,
		borderRadius: 8,
	},
	statsText: {
		fontSize: 14,
		color: "#374151",
		fontWeight: "500",
	},
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
		borderLeftColor: "#10B981",
	},
	inactiveCard: {
		borderLeftColor: "#EF4444",
		backgroundColor: "#FEFEFE",
		opacity: 0.8,
	},
	deliveryManInfo: { flex: 1, marginRight: 15 },
	nameContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 4,
	},
	deliveryManName: {
		fontSize: 18,
		fontWeight: "600",
		color: "#1F2937",
		flex: 1,
	},
	inactiveText: {
		color: "#6B7280",
	},
	deliveryManPhone: {
		fontSize: 14,
		color: "#5563EB",
		marginBottom: 6,
	},
	deliveryManStats: {
		fontSize: 12,
		color: "#6B7280",
		marginBottom: 4,
	},
	distributorText: {
		fontSize: 12,
		color: "#9CA3AF",
		fontStyle: "italic",
	},

	statusBadge: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 12,
		marginLeft: 10,
	},
	activeBadge: {
		backgroundColor: "#DCFCE7",
	},
	inactiveBadge: {
		backgroundColor: "#FEE2E2",
	},
	statusText: {
		fontSize: 12,
		fontWeight: "600",
	},
	activeStatusText: {
		color: "#166534",
	},
	inactiveStatusText: {
		color: "#DC2626",
	},

	actionsContainer: {
		flexDirection: "column",
		alignItems: "center",
	},
	statusButton: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 10,
		borderRadius: 8,
		marginBottom: 8,
		minWidth: 100,
		justifyContent: "center",
	},
	activateButton: {
		backgroundColor: "#10B981",
	},
	deactivateButton: {
		backgroundColor: "#EF4444",
	},
	statusButtonText: {
		color: "#FFF",
		fontSize: 13,
		fontWeight: "600",
		marginLeft: 6,
	},
	iconButton: {
		alignItems: "center",
		paddingVertical: 4,
	},
	iconText: {
		fontSize: 12,
		marginTop: 2,
		color: "#4B5563",
	},

	emptyContainer: {
		alignItems: "center",
		paddingVertical: 60,
	},
	emptyText: {
		fontSize: 16,
		color: "#6B7280",
		marginTop: 10,
	},
	emptySubtext: {
		fontSize: 14,
		color: "#9CA3AF",
		marginTop: 6,
	},
});

export default DeliveryManManagement;
