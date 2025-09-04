"use client";

import { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	Alert,
	RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import ApiService from "../../api/api-service";
import LoadingIndicator from "../../components/Loader";

const DeliveryDashboard = () => {
	const navigation = useNavigation();
	const { inspections, products, refreshData } = useData();

	const { user, logout, token } = useAuth();
	const [dashboardStats, setDashboardStats] = useState({
		todayInspections: 0,
		totalInspections: 0,
		totalSales: 0,
		assignedProducts: 0,
	});

	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);

	useEffect(() => {
		fetchDashboardData();
	}, []);

	const fetchDashboardData = async () => {
		try {
			setLoading(true);
			await refreshData();

			// // Calculate stats from local data
			// const myInspections = inspections?.filter(
			// 	(inspection) => inspection.deliveryManId === user?.id
			// );
			// const today = new Date().toDateString();
			// const todayInspections = myInspections.filter(
			// 	(inspection) => new Date(inspection.date).toDateString() === today
			// ).length;

			// const totalSales = myInspections.reduce(
			// 	(sum, inspection) => sum + inspection.totalAmount,
			// 	0
			// );

			// const assignedProducts = products?.products?.filter(
			// 	(product) => product.assignedTo === user?.id
			// ).length;

			// setDashboardStats({
			// 	todayInspections,
			// 	totalInspections: myInspections.length,
			// 	totalSales,
			// 	assignedProducts,
			// });

			// Optionally fetch additional stats from API if available
			if (token && user?.distributorId) {
				try {
					const statsResponse = await ApiService.getDashboardStats(
						user.distributorId
					);

					if (statsResponse.success && statsResponse.data.deliveryManStats) {
						const myStats = statsResponse.data.deliveryManStats.find(
							(stat) => stat.deliveryManId === user.id
						);
						if (myStats) {
							setDashboardStats((prev) => ({
								...prev,
								...myStats,
							}));
						}
					}
				} catch (error) {
					console.error("Additional stats fetch failed:", error);
				}
			}
		} catch (error) {
			console.error("Dashboard fetch error:", error);
			Alert.alert("Error", "Failed to load dashboard data. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		setDashboardStats({
			...dashboardStats,
			totalInspections: inspections.filter(
				(item) => item.deliveryManId._id === user.id
			).length,
			todayInspections: inspections
				.filter((item) => item.deliveryManId._id === user.id)
				.filter(
					(item) =>
						new Date(item.createdAt).toDateString() ===
						new Date().toDateString()
				).length,
		});
	}, [inspections]);

	const onRefresh = async () => {
		setRefreshing(true);
		await fetchDashboardData();
		setRefreshing(false);
	};

	const handleLogout = () => {
		Alert.alert("Logout", "Are you sure you want to logout?", [
			{ text: "Cancel", style: "cancel" },
			{ text: "Logout", onPress: logout },
		]);
	};

	const menuItems = [
		{
			title: "New Inspection",
			icon: "add-circle",
			screen: "NewInspection",
			color: "#10B981",
			description: "Start a new safety inspection",
		},
		{
			title: "My History",
			icon: "time",
			screen: "DeliveryHistory",
			color: "#5563EB",
			description: "View your inspection history",
		},
		// {
		// 	title: "Assigned Products",
		// 	icon: "cube",
		// 	screen: "AssignedProducts",
		// 	color: "#F59E0B",
		// 	description: "View your assigned products",
		// },
		// {
		// 	title: "Profile",
		// 	icon: "person",
		// 	screen: "Profile",
		// 	color: "#8B5CF6",
		// 	description: "Manage your profile",
		// },
	];

	if (loading) {
		return (
			<View>
				<LoadingIndicator />
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<ScrollView
				style={styles.content}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
				}
			>
				{/* Welcome Section */}
				<View style={styles.welcomeSection}>
					<View>
						<Text style={styles.welcomeText}>Welcome back,</Text>
						<Text style={styles.userName}>
							{user?.name || "Delivery Person"}
						</Text>
						<Text style={styles.userRole}>Delivery Executive</Text>
					</View>
					<TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
						<Text style={styles.logoutText}>Logout</Text>
					</TouchableOpacity>
				</View>

				{/* Stats Cards */}
				<View style={styles.statsContainer}>
					<View style={styles.statCard}>
						<Ionicons name='today' size={24} color='#10B981' />
						<Text style={styles.statNumber}>
							{dashboardStats.todayInspections}
						</Text>
						<Text style={styles.statLabel}>Today's Inspections</Text>
					</View>
					<View style={styles.statCard}>
						<Ionicons name='document-text' size={24} color='#5563EB' />
						<Text style={styles.statNumber}>
							{dashboardStats.totalInspections}
						</Text>
						<Text style={styles.statLabel}>Total Inspections</Text>
					</View>
					{/* <View style={styles.statCard}>
						<Ionicons name='cash' size={24} color='#F59E0B' />
						<Text style={styles.statNumber}>
							₹{dashboardStats.totalSales.toLocaleString()}
						</Text>
						<Text style={styles.statLabel}>Total Sales</Text>
					</View>
					<View style={styles.statCard}>
						<Ionicons name='cube' size={24} color='#8B5CF6' />
						<Text style={styles.statNumber}>
							{dashboardStats.assignedProducts}
						</Text>
						<Text style={styles.statLabel}>Assigned Products</Text>
					</View> */}
				</View>

				{/* Quick Actions */}
				<View style={styles.quickActionsContainer}>
					<Text style={styles.quickActionsTitle}>Quick Actions</Text>
					<View style={styles.menuGrid}>
						{menuItems.map((item, index) => (
							<TouchableOpacity
								key={index}
								style={[styles.menuItem, { backgroundColor: item.color }]}
								onPress={() => navigation.navigate(item.screen as never)}
							>
								<Ionicons name={item.icon as any} size={32} color='#FFFFFF' />
								<Text style={styles.menuText}>{item.title}</Text>
								<Text style={styles.menuDescription}>{item.description}</Text>
							</TouchableOpacity>
						))}
					</View>
				</View>

				{/* Recent Activity */}
				<View style={styles.recentActivityContainer}>
					<Text style={styles.recentActivityTitle}>Recent Inspections</Text>
					{inspections
						?.filter((inspection) => inspection.deliveryManId._id === user?.id)
						.slice(0, 3)
						.map((inspection, index) => (
							<TouchableOpacity
								key={index}
								style={styles.activityItem}
								onPress={() =>
									navigation.navigate(
										"InspectionDetails" as never,
										{ inspection } as never
									)
								}
							>
								<View style={styles.activityInfo}>
									<Text style={styles.activityTitle}>
										{inspection?.consumer.name}
									</Text>
									<Text style={styles.activitySubtitle}>
										Consumer Number: {inspection?.consumer.consumerNumber}
									</Text>
									<Text style={styles.activitySubtitle}>
										Date:{" "}
										{new Date(inspection.createdAt).toLocaleDateString(
											"en-GB",
											{
												day: "2-digit",
												month: "short",
												year: "numeric",
											}
										)}{" "}
										• ₹{inspection.totalAmount}
									</Text>
								</View>
								<Ionicons name='chevron-forward' size={20} color='#6B7280' />
							</TouchableOpacity>
						))}
					{inspections?.filter(
						(inspection) => inspection.deliveryManId._id === user?.id
					).length === 0 && (
						<View style={styles.emptyActivity}>
							<Text style={styles.emptyActivityText}>No inspections yet</Text>
							<Text style={styles.emptyActivitySubtext}>
								Start your first inspection to see it here
							</Text>
						</View>
					)}
				</View>
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F8FAFC",
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#F8FAFC",
	},
	loadingText: {
		fontSize: 16,
		color: "#6B7280",
	},
	header: {
		backgroundColor: "#5563EB",
		paddingHorizontal: 20,
		paddingTop: 50,
		paddingBottom: 16,
	},
	headerContent: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: "600",
		color: "#FFFFFF",
	},
	content: {
		flex: 1,
	},
	welcomeSection: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 20,
		backgroundColor: "#FFFFFF",
		borderBottomWidth: 1,
		borderBottomColor: "#E5E7EB",
	},
	welcomeText: {
		fontSize: 16,
		color: "#6B7280",
	},
	logoutButton: {
		backgroundColor: "#EF4444",
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 8,
	},
	logoutText: {
		color: "#FFFFFF",
		fontWeight: "500",
	},
	userName: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#1F2937",
		marginTop: 4,
	},
	userRole: {
		fontSize: 14,
		color: "#5563EB",
		marginTop: 2,
		fontWeight: "500",
	},
	statsContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		padding: 20,
		gap: 12,
	},
	statCard: {
		backgroundColor: "#FFFFFF",
		borderRadius: 12,
		padding: 16,
		flex: 1,
		minWidth: "40%",
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	statNumber: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#1F2937",
		marginTop: 8,
		marginBottom: 4,
	},
	statLabel: {
		fontSize: 12,
		color: "#6B7280",
		textAlign: "center",
	},
	quickActionsContainer: {
		padding: 20,
	},
	quickActionsTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#1F2937",
		marginBottom: 16,
	},
	menuGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 12,
	},
	menuItem: {
		flex: 1,
		minWidth: "45%",
		borderRadius: 12,
		padding: 20,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	menuText: {
		color: "#FFFFFF",
		fontSize: 16,
		fontWeight: "600",
		textAlign: "center",
		marginTop: 8,
	},
	menuDescription: {
		color: "rgba(255, 255, 255, 0.8)",
		fontSize: 12,
		textAlign: "center",
		marginTop: 4,
	},
	recentActivityContainer: {
		backgroundColor: "#FFFFFF",
		marginHorizontal: 20,
		marginBottom: 20,
		borderRadius: 12,
		padding: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	recentActivityTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#1F2937",
		marginBottom: 16,
	},
	activityItem: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: "#F3F4F6",
	},
	activityInfo: {
		flex: 1,
	},
	activityTitle: {
		fontSize: 16,
		fontWeight: "500",
		color: "#1F2937",
	},
	activitySubtitle: {
		fontSize: 14,
		color: "#6B7280",
		marginTop: 2,
	},
	emptyActivity: {
		alignItems: "center",
		paddingVertical: 32,
	},
	emptyActivityText: {
		fontSize: 16,
		color: "#6B7280",
		fontWeight: "500",
	},
	emptyActivitySubtext: {
		fontSize: 14,
		color: "#9CA3AF",
		marginTop: 4,
		textAlign: "center",
	},
});

export default DeliveryDashboard;
