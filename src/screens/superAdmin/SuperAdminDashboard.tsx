"use client";

import { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	FlatList,
	Alert,
	Modal,
	TextInput,
	RefreshControl,
	Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ApiService from "../../api/api-service";
import { useAuth } from "../../context/AuthContext";

const SuperAdminDashboard = () => {
	const { logout } = useAuth();

	const [stats, setStats] = useState({
		totalDistributors: 0,
		pendingRequests: 0,
		totalInspections: 0,
		totalRevenue: 0,
	});
	const [pendingRequests, setPendingRequests] = useState([]);
	const [distributors, setDistributors] = useState([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [selectedRequest, setSelectedRequest] = useState(null);
	const [showRejectModal, setShowRejectModal] = useState(false);
	const [rejectReason, setRejectReason] = useState("");

	useEffect(() => {
		fetchDashboardData();
	}, []);

	const fetchDashboardData = async () => {
		try {
			setLoading(true);

			// Fetch all data in parallel
			const [statsResponse, requestsResponse, distributorsResponse] =
				await Promise.all([
					ApiService.getSuperAdminStats(),
					ApiService.getPendingRequests(),
					ApiService.getAllDistributors(),
				]);

			if (statsResponse.success) {
				setStats(statsResponse.data);
			}

			if (requestsResponse.success) {
				setPendingRequests(
					(requestsResponse?.data?.requests || []).filter(
						(request) => request.status === "pending"
					)
				);
			}

			if (distributorsResponse.success) {
				setDistributors(
					(requestsResponse?.data?.requests || []).filter(
						(request) => request.status === "approved"
					)
				);
			}
		} catch (error) {
			console.error("Dashboard fetch error:", error);
			Alert.alert("Error", "Failed to load dashboard data. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const onRefresh = async () => {
		setRefreshing(true);
		await fetchDashboardData();
		setRefreshing(false);
	};

	const handleApproveDistributor = async (requestId) => {
		Alert.alert(
			"Approve Distributor",
			"Are you sure you want to approve this distributor request?",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Approve",
					onPress: async () => {
						try {
							const response = await ApiService.approveDistributor(requestId);
							if (response.success) {
								Alert.alert("Success", "Distributor approved successfully!");
								console.log("response", response)
								fetchDashboardData(); // Refresh data
							} else {
								Alert.alert(
									"Error",
									response.error || "Failed to approve distributor"
								);
							}
						} catch (error) {
							console.error("Approve error:", error);
							Alert.alert(
								"Error",
								"Failed to approve distributor. Please try again."
							);
						}
					},
				},
			]
		);
	};

	const handleRejectDistributor = (request) => {
		setSelectedRequest(request);
		setShowRejectModal(true);
	};

	const submitRejection = async () => {
		if (!rejectReason.trim()) {
			Alert.alert("Error", "Please provide a reason for rejection");
			return;
		}

		try {
			const response = await ApiService.rejectDistributor(
				selectedRequest._id,
				rejectReason
			);
			if (response.success) {
				Alert.alert("Success", "Distributor request rejected successfully!");
				setShowRejectModal(false);
				setRejectReason("");
				setSelectedRequest(null);
				fetchDashboardData(); // Refresh data
			} else {
				Alert.alert("Error", response.error || "Failed to reject distributor");
			}
		} catch (error) {
			console.error("Reject error:", error);
			Alert.alert("Error", "Failed to reject distributor. Please try again.");
		}
	};

	const renderPendingRequest = ({ item }) => (
		<View style={styles.requestCard}>
			<View style={styles.requestInfo}>
				<Text style={styles.agencyName}>{item.agencyName}</Text>
				<Text style={styles.sapCode}>SAP Code: {item.sapCode}</Text>
				<Text style={styles.adminName}>Admin: {item.adminName}</Text>
				<Text style={styles.requestDate}>
					Requested: {new Date(item.createdAt).toLocaleDateString()}
				</Text>
			</View>
			<View style={styles.requestActions}>
				<TouchableOpacity
					style={styles.approveButton}
					onPress={() => handleApproveDistributor(item._id)}
				>
					<Ionicons name='checkmark' size={16} color='#FFFFFF' />
					<Text style={styles.approveButtonText}>Approve</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.rejectButton}
					onPress={() => handleRejectDistributor(item)}
				>
					<Ionicons name='close' size={16} color='#FFFFFF' />
					<Text style={styles.rejectButtonText}>Reject</Text>
				</TouchableOpacity>
			</View>
		</View>
	);

	const renderDistributor = ({ item }) => (
		<View style={styles.distributorCard}>
			<View style={styles.distributorInfo}>
				<Text style={styles.distributorName}>{item.agencyName}</Text>
				<Text style={styles.distributorSap}>SAP: {item.sapCode}</Text>
				<Text style={styles.distributorAdmin}>Admin: {item.adminName}</Text>
				<Text style={styles.distributorStats}>
					Delivery Men: {item.deliveryMen?.length || 0}
				</Text>
				<Text style={styles.distributorStats}>
					Requested At:{" "}
					{new Date(item.requestedAt).toLocaleTimeString("en-GB", {
						day: "2-digit",
						month: "short",
						year: "numeric",
					})}
				</Text>
				
				<Text style={styles.distributorStats}>
					Rejected At:{" "}
					{new Date(item.updatedAt).toLocaleTimeString("en-GB", {
						day: "2-digit",
						month: "short",
						year: "numeric",
					})}
				</Text>
			</View>
		</View>
	);

	const handleLogout = () => {
		Alert.alert("Logout", "Are you sure you want to logout?", [
			{ text: "Cancel", style: "cancel" },
			{ text: "Logout", onPress: logout },
		]);
	};

	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<Text style={styles.loadingText}>Loading dashboard...</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<View style={styles.welcomeSection}>
				<View>
					<Text style={styles.welcomeText}>Welcome back,</Text>
					<Text style={styles.userName}>{"Super Admin"}</Text>
				</View>
				<TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
					<Text style={styles.logoutText}>Logout</Text>
				</TouchableOpacity>
			</View>

			<ScrollView
				style={styles.content}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
				}
			>
				{/* Stats Cards */}
				<View style={styles.statsContainer}>
					<View style={styles.statCard}>
						<Ionicons name='business' size={24} color='#5563EB' />
						<Text style={styles.statNumber}>{stats.totalDistributors}</Text>
						<Text style={styles.statLabel}>Total Distributors</Text>
					</View>
					<View style={styles.statCard}>
						<Ionicons name='time' size={24} color='#F59E0B' />
						<Text style={styles.statNumber}>{stats.pendingRequests}</Text>
						<Text style={styles.statLabel}>Pending Requests</Text>
					</View>
					<View style={styles.statCard}>
						<Ionicons name='document-text' size={24} color='#10B981' />
						<Text style={styles.statNumber}>{stats.totalInspections}</Text>
						<Text style={styles.statLabel}>Total Inspections</Text>
					</View>
					<View style={styles.statCard}>
						<Ionicons name='cash' size={24} color='#8B5CF6' />
						<Text style={styles.statNumber}>
							₹{stats.totalRevenue?.toLocaleString() || 0}
						</Text>
						<Text style={styles.statLabel}>Total Revenue</Text>
					</View>
				</View>

				{/* Pending Requests */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>
						Pending Distributor Requests ({pendingRequests.length})
					</Text>
					{pendingRequests.length > 0 ? (
						<FlatList
							data={pendingRequests}
							renderItem={renderPendingRequest}
							keyExtractor={(item) => item.id}
							scrollEnabled={false}
							showsVerticalScrollIndicator={false}
						/>
					) : (
						<View style={styles.emptyContainer}>
							<Text style={styles.emptyText}>No pending requests</Text>
						</View>
					)}
				</View>

				{/* Active Distributors */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>
						Active Distributors ({distributors.length})
					</Text>
					{distributors.length > 0 ? (
						<FlatList
							data={distributors}
							renderItem={renderDistributor}
							keyExtractor={(item) => item._id}
							scrollEnabled={false}
							showsVerticalScrollIndicator={false}
						/>
					) : (
						<View style={styles.emptyContainer}>
							<Text style={styles.emptyText}>No distributors found</Text>
						</View>
					)}
				</View>
			</ScrollView>

			{/* Reject Modal */}
			<Modal
				visible={showRejectModal}
				animationType='slide'
				transparent={true}
				onRequestClose={() => setShowRejectModal(false)}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>Reject Distributor Request</Text>
						<Text style={styles.modalSubtitle}>
							Please provide a reason for rejecting{" "}
							{selectedRequest?.agencyName}
						</Text>

						<TextInput
							style={styles.reasonInput}
							value={rejectReason}
							onChangeText={setRejectReason}
							placeholder='Enter rejection reason...'
							multiline
							numberOfLines={4}
							textAlignVertical='top'
						/>

						<View style={styles.modalButtons}>
							<TouchableOpacity
								style={styles.cancelButton}
								onPress={() => {
									setShowRejectModal(false);
									setRejectReason("");
									setSelectedRequest(null);
								}}
							>
								<Text style={styles.cancelButtonText}>Cancel</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={styles.submitRejectButton}
								onPress={submitRejection}
							>
								<Text style={styles.submitRejectButtonText}>Reject</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
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
	headerTitle: {
		fontSize: 20,
		fontWeight: "600",
		color: "#FFFFFF",
	},
	content: {
		flex: 1,
	},
	statsContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		padding: 20,
		gap: 12,
	},
	userName: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#1F2937",
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
		color: "#1F2937",
		marginTop: 8,
		marginBottom: 4,
	},
	statLabel: {
		fontSize: 12,
		color: "#6B7280",
		textAlign: "center",
	},
	section: {
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
	sectionTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#1F2937",
		marginBottom: 16,
	},
	requestCard: {
		backgroundColor: "#F9FAFB",
		borderRadius: 8,
		padding: 16,
		marginBottom: 12,
		borderLeftWidth: 4,
		borderLeftColor: "#F59E0B",
	},
	requestInfo: {
		marginBottom: 12,
	},
	agencyName: {
		fontSize: 16,
		fontWeight: "600",
		color: "#1F2937",
		marginBottom: 4,
	},
	sapCode: {
		fontSize: 14,
		color: "#6B7280",
		marginBottom: 2,
	},
	adminName: {
		fontSize: 14,
		color: "#6B7280",
		marginBottom: 2,
	},
	requestDate: {
		fontSize: 12,
		color: "#9CA3AF",
	},
	requestActions: {
		flexDirection: "row",
		gap: 8,
	},
	approveButton: {
		backgroundColor: "#10B981",
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 6,
		flex: 1,
		justifyContent: "center",
	},
	approveButtonText: {
		color: "#FFFFFF",
		fontSize: 14,
		fontWeight: "500",
		marginLeft: 4,
	},
	rejectButton: {
		backgroundColor: "#EF4444",
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 6,
		flex: 1,
		justifyContent: "center",
	},
	rejectButtonText: {
		color: "#FFFFFF",
		fontSize: 14,
		fontWeight: "500",
		marginLeft: 4,
	},
	distributorCard: {
		backgroundColor: "#F9FAFB",
		borderRadius: 8,
		padding: 16,
		marginBottom: 12,
		flexDirection: "row",
		alignItems: "center",
		borderLeftWidth: 4,
		borderLeftColor: "#10B981",
	},
	rejectDistributorCard: {
		backgroundColor: "#F9FAFB",
		borderRadius: 8,
		padding: 16,
		marginBottom: 12,
		flexDirection: "row",
		alignItems: "center",
		borderLeftWidth: 4,
		borderLeftColor: "#FF0000",
	},
	distributorInfo: {
		flex: 1,
	},
	distributorName: {
		fontSize: 16,
		fontWeight: "600",
		color: "#1F2937",
		marginBottom: 4,
	},
	distributorSap: {
		fontSize: 14,
		color: "#6B7280",
		marginBottom: 2,
	},
	distributorAdmin: {
		fontSize: 14,
		color: "#6B7280",
		marginBottom: 2,
	},
	distributorStats: {
		fontSize: 12,
		color: "#9CA3AF",
	},
	statusBadge: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 12,
	},
	statusText: {
		color: "#FFFFFF",
		fontSize: 12,
		fontWeight: "500",
	},
	emptyContainer: {
		alignItems: "center",
		paddingVertical: 32,
	},
	emptyText: {
		fontSize: 16,
		color: "#6B7280",
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "center",
		alignItems: "center",
	},
	modalContent: {
		backgroundColor: "#FFFFFF",
		borderRadius: 16,
		padding: 24,
		width: "90%",
		maxWidth: 400,
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#1F2937",
		marginBottom: 8,
		textAlign: "center",
	},
	modalSubtitle: {
		fontSize: 14,
		color: "#6B7280",
		marginBottom: 20,
		textAlign: "center",
	},
	reasonInput: {
		borderWidth: 1,
		borderColor: "#D1D5DB",
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 10,
		fontSize: 14,
		backgroundColor: "#F9FAFB",
		height: 100,
		marginBottom: 20,
	},
	modalButtons: {
		flexDirection: "row",
		gap: 12,
	},
	cancelButton: {
		flex: 1,
		backgroundColor: "#F3F4F6",
		borderRadius: 8,
		paddingVertical: 12,
		alignItems: "center",
	},
	cancelButtonText: {
		color: "#374151",
		fontSize: 16,
		fontWeight: "500",
	},
	submitRejectButton: {
		flex: 1,
		backgroundColor: "#EF4444",
		borderRadius: 8,
		paddingVertical: 12,
		alignItems: "center",
	},
	submitRejectButtonText: {
		color: "#FFFFFF",
		fontSize: 16,
		fontWeight: "600",
	},
});

export default SuperAdminDashboard;
