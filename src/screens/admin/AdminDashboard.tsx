"use client";

import { useState, useEffect, useCallback } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	Dimensions,
	Alert,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { LineChart } from "react-native-chart-kit";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import ApiService from "../../api/api-service";
import LoadingIndicator from "../../components/Loader";
import {
	exportInspectionsViaApiService,
	handleInlineExport,
} from "../../common-functions/ExportExcel";
const screenWidth = Dimensions.get("window").width;

const AdminDashboard = () => {
	const navigation = useNavigation();
	const { inspections, deliveryMen, refreshData, appSettings } = useData();
	const { user, logout, token } = useAuth();
	const [dashboardStats, setDashboardStats] = useState(null);
	const [loading, setLoading] = useState(true);
	const [chartData, setChartData] = useState({
		labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
		datasets: [{ data: [0, 0, 0, 0, 0, 0, 0], strokeWidth: 2 }],
	});

	const fetchDashboardData = async () => {
		try {
			setLoading(true);
			await refreshData();

			// Fetch chart data
			const weeklyResponse = await ApiService.getWeeklyInspections();
			if (weeklyResponse.success) {
				const weeklyData = weeklyResponse.data.weeklyData;

				setChartData({
					labels: weeklyData.map((item) => item.day),
					datasets: [
						{
							data: weeklyData.map((item) => item.count),
							strokeWidth: 2,
						},
					],
				});
			}

			if (token) {
				const statsResponse = await ApiService.getDashboardStats(token);
				if (statsResponse.success) {
					setDashboardStats(statsResponse.data);
				}
			}
		} catch (error) {
			console.error("Dashboard fetch error:", error);
		} finally {
			setLoading(false);
		}
	};

	const today = new Date().toDateString();
	const todayInspections = inspections
		? (inspections || [])?.filter(
				(inspection) =>
					new Date(inspection.inspectionDate).toDateString() === today
		  )?.length
		: 0;

	const totalSales = inspections
		? (inspections || [])?.reduce(
				(sum, inspection) => sum + inspection.totalAmount,
				0
		  )
		: 0;

	const menuItems = [
		{ title: "History", icon: "📊", screen: "AdminHistory", color: "#5563EB" },
		{
			title: "Assign Stock",
			icon: "📦",
			screen: "AssignStock",
			color: "#10B981",
		},
		{
			title: "Add Product",
			icon: "➕",
			screen: "AddProduct",
			color: "#F59E0B",
		},
		{
			title: "Search Inspection",
			icon: "🔍",
			screen: "SearchInspection",
			color: "#8B5CF6",
		},
		{
			title: "Register Delivery Man",
			icon: "➕",
			screen: "Register",
			color: "#F87171",
		},
		{
			title: "Manage Delivery Men",
			icon: "👨‍💼",
			screen: "ManageDeliveryMen",
			color: "#3B82F6",
		},
		{
			title: "General Settings",
			icon: "⚙️",
			screen: "AppSettings",
			color: "#E67E22",
		},
	];

	const handleLogout = () => {
		Alert.alert("Logout", "Are you sure you want to logout?", [
			{ text: "Cancel", style: "cancel" },
			{ text: "Logout", onPress: logout },
		]);
	};

	useFocusEffect(
		useCallback(() => {
			fetchDashboardData();
		}, [])
	);

	if (loading) {
		return (
			<View>
				<LoadingIndicator />
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<ScrollView style={styles.content}>
				{/* Welcome Section */}
				<View style={styles.welcomeSection}>
					<View>
						<Text style={styles.welcomeText}>Welcome back,</Text>
						<Text style={styles.userName}>{user?.name || "Admin User"}</Text>
					</View>
					<TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
						<Text style={styles.logoutText}>Logout</Text>
					</TouchableOpacity>
				</View>

				{/* Stats Cards */}
				<View style={styles.statsContainer}>
					<View style={styles.statCard}>
						<Text style={styles.statNumber}>
							{dashboardStats?.totalDeliveryMen || deliveryMen.length || 0}
						</Text>
						<Text style={styles.statLabel}>Delivery Men</Text>
					</View>
					<View style={styles.statCard}>
						<Text style={styles.statNumber}>{inspections?.length}</Text>
						<Text style={styles.statLabel}>Total Inspections</Text>
					</View>
					<View style={styles.statCard}>
						<Text style={styles.statNumber}>{todayInspections}</Text>
						<Text style={styles.statLabel}>Today's Inspections</Text>
					</View>
					<View style={styles.statCard}>
						<Text style={styles.statNumber}>
							₹{totalSales.toLocaleString()}
						</Text>
						<Text style={styles.statLabel}>Total Sales</Text>
					</View>
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
								<Text style={styles.menuIcon}>{item.icon}</Text>
								<Text style={styles.menuText}>{item.title}</Text>
							</TouchableOpacity>
						))}
						<TouchableOpacity
							style={[styles.menuItem, { backgroundColor: "#661CC9" }]}
							onPress={async () => {
								try {
									const result = await handleInlineExport(
										inspections,
										deliveryMen,
										token || ""
									);

									if (result.success) {
										Alert.alert("Success", result.message);
									}
								} catch (error) {
									Alert.alert("Export Error", error.message);
								}
							}}
						>
							<Text style={styles.menuIcon}>📥</Text>
							<Text style={styles.menuText}>Export Inspections</Text>
						</TouchableOpacity>
					</View>
				</View>

				{/* Chart */}
				<View style={styles.chartContainer}>
					<Text style={styles.chartTitle}>Weekly Inspections</Text>
					<LineChart
						data={chartData}
						width={screenWidth - 40}
						height={220}
						chartConfig={{
							backgroundColor: "#ffffff",
							backgroundGradientFrom: "#ffffff",
							backgroundGradientTo: "#ffffff",
							decimalPlaces: 0,
							color: (opacity = 1) => `rgba(85, 99, 235, ${opacity})`,
							labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
							style: {
								borderRadius: 16,
							},
							propsForDots: {
								r: "6",
								strokeWidth: "2",
								stroke: "#5563EB",
							},
						}}
						bezier
						style={styles.chart}
					/>
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
	userName: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#1F2937",
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
		fontSize: 24,
		fontWeight: "bold",
		color: "#5563EB",
		marginBottom: 4,
	},
	statLabel: {
		fontSize: 12,
		color: "#6B7280",
		textAlign: "center",
	},
	exportButtonContainer: {
		alignItems: "center",
		flexDirection: "row",
		justifyContent: "center",
		gap: 8,
		width: "auto",
		alignSelf: "center",
		marginTop: 20,
		backgroundColor: "#661CC9",
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 8,
	},
	exportIcon: {
		fontSize: 24,
		color: "#FFFFFF",
	},
	chartContainer: {
		backgroundColor: "#FFFFFF",
		margin: 20,
		borderRadius: 16,
		padding: 0,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	chartTitle: {
		fontSize: 18,
		fontWeight: "600",
		padding: 16,
		color: "#1F2937",
	},
	chart: {
		borderRadius: 16,
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
		maxWidth: "50%",
		borderRadius: 12,
		padding: 20,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	menuIcon: {
		fontSize: 32,
		marginBottom: 8,
	},
	menuText: {
		color: "#FFFFFF",
		fontSize: 14,
		fontWeight: "600",
		textAlign: "center",
	},
});

export default AdminDashboard;
