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
import LoadingIndicator from "../../components/Loader";
import { exportInspectionsViaApiService } from "../../common-functions/ExportExcel"; // Import your existing export function
import { useData } from "../../context/DataContext";

const SuperAdminDashboard = () => {
	const { logout, token } = useAuth();
	const { inspections } = useData();

	const [stats, setStats] = useState({
		totalDistributors: 0,
		pendingRequests: 0,
		totalInspections: 0,
		totalRevenue: 0,
	});
	const [pendingRequests, setPendingRequests] = useState([]);
	const [distributors, setDistributors] = useState([]);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [selectedRequest, setSelectedRequest] = useState(null);
	const [showRejectModal, setShowRejectModal] = useState(false);
	const [rejectReason, setRejectReason] = useState("");

	// New states for distributor-specific data
	const [selectedDistributor, setSelectedDistributor] = useState(null);
	const [distributorData, setDistributorData] = useState({
		products: [],
		deliveryMen: [],
		inspections: [],
		appSettings: null,
	});
	const [showDistributorModal, setShowDistributorModal] = useState(false);
	const [loadingDistributorData, setLoadingDistributorData] = useState(false);
	const [exportingDistributorId, setExportingDistributorId] = useState(null);

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

	const handleViewDistributorData = (distributor) => {
		setSelectedDistributor(distributor);
		setShowDistributorModal(true);
		// Fetch data for this distributor
		fetchDistributorData(distributor._id || distributor.distributorId);
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

	// New function to fetch distributor-specific data
	const fetchDistributorData = async (distributorId) => {
		try {
			setLoadingDistributorData(true);

			if (!token) {
				Alert.alert("Error", "Authentication token not available");
				return;
			}

			// Set token for API service
			ApiService.setToken(token);

			// Prepare API calls with proper parameters
			const apiCalls = [];

			// Get products - use distributorId parameter
			apiCalls.push(
				ApiService.getProducts(distributorId).catch((error) => {
					console.error("Products API error:", error);
					return { success: false, error: error.message, data: [] };
				})
			);

			// Get delivery men - use distributorId parameter
			apiCalls.push(
				ApiService.getDeliveryMen(distributorId).catch((error) => {
					console.error("Delivery men API error:", error);
					return { success: false, error: error.message, data: [] };
				})
			);

			// Get inspections - try with distributorId (check if your API supports this)
			apiCalls.push(
				ApiService.getInspections(distributorId).catch((error) => {
					console.error("Inspections API error:", error);
					// If distributor-specific inspections fail, try general inspections
					return ApiService.getInspections().catch((fallbackError) => {
						console.error("General inspections API error:", fallbackError);
						return { success: false, error: fallbackError.message, data: [] };
					});
				})
			);

			// Get app settings - use distributorId parameter
			apiCalls.push(
				ApiService.getAppSettings(distributorId).catch((error) => {
					console.error("App settings API error:", error);
					return {
						success: false,
						error: error.message,
						data: { appSettings: null },
					};
				})
			);

			// Execute all API calls in parallel
			const [
				productsResponse,
				deliveryMenResponse,
				inspectionsResponse,
				appSettingsResponse,
			] = await Promise.all(apiCalls);

			// Handle products response
			const products =
				productsResponse?.success && productsResponse.data
					? Array.isArray(productsResponse.data)
						? productsResponse.data
						: productsResponse.data.products || []
					: [];

			// Handle delivery men response
			const deliveryMen =
				deliveryMenResponse?.success && deliveryMenResponse.data
					? Array.isArray(deliveryMenResponse.data)
						? deliveryMenResponse.data
						: deliveryMenResponse.data.deliveryMen || []
					: [];

			// Handle inspections response
			const inspections =
				inspectionsResponse?.success && inspectionsResponse.data
					? Array.isArray(inspectionsResponse.data)
						? inspectionsResponse.data
						: inspectionsResponse.data.inspections || []
					: [];

			// Handle app settings response
			const appSettings =
				appSettingsResponse?.success && appSettingsResponse.data
					? appSettingsResponse.data.appSettings || appSettingsResponse.data
					: null;

			// Set distributor data
			setDistributorData({
				products,
				deliveryMen,
				inspections,
				appSettings,
			});

			console.log("✅ Distributor data fetched successfully:", {
				productsCount: products.length,
				deliveryMenCount: deliveryMen.length,
				inspectionsCount: inspections.length,
				hasAppSettings: !!appSettings,
			});
		} catch (error) {
			console.error("❌ Error fetching distributor data:", error);
			Alert.alert(
				"Error",
				"Failed to load distributor data. Please try again."
			);
		} finally {
			setLoadingDistributorData(false);
		}
	};

	// New function to handle CSV export for specific distributor
	const handleExportDistributorInspections = async (distributor) => {
		try {
			if (!token) {
				Alert.alert("Error", "Authentication token not available");
				return;
			}

			const distributorId = distributor._id || distributor.id;
			setExportingDistributorId(distributorId);

			// Set token for API service
			ApiService.setToken(token);

			// Fetch distributor's inspections and delivery men
			const [inspectionsResponse, deliveryMenResponse] = await Promise.all([
				ApiService.getInspections(distributorId).catch(() => ({
					success: false,
					data: [],
				})),
				ApiService.getDeliveryMen(distributorId).catch(() => ({
					success: false,
					data: [],
				})),
			]);

			// Extract inspections data
			const inspections =
				inspectionsResponse?.success && inspectionsResponse.data
					? Array.isArray(inspectionsResponse.data)
						? inspectionsResponse.data
						: inspectionsResponse.data.inspections || []
					: [];

			// Extract delivery men data
			const deliveryMen =
				deliveryMenResponse?.success && deliveryMenResponse.data
					? Array.isArray(deliveryMenResponse.data)
						? deliveryMenResponse.data
						: deliveryMenResponse.data.deliveryMen || []
					: [];

			if (inspections.length === 0) {
				Alert.alert(
					"No Data",
					`No inspections found for ${distributor.agencyName}`
				);
				return;
			}

			// Generate filename with distributor info
			const fileName = `${distributor.agencyName}_${
				distributor.sapCode
			}_inspections_${new Date().toISOString().slice(0, 10)}`;

			// Call the export function
			const result = await exportInspectionsViaApiService(
				inspections,
				deliveryMen,
				fileName,
				token
			);

			if (result.success) {
				Alert.alert(
					"Success",
					`Exported ${inspections.length} inspections for ${distributor.agencyName}`
				);
			}
		} catch (error) {
			console.error("Export error for distributor:", error);
			Alert.alert(
				"Export Error",
				error.message || "Failed to export inspections"
			);
		} finally {
			setExportingDistributorId(null);
		}
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

	const renderDistributor = ({ item }) => {
		const isExporting = exportingDistributorId === (item._id || item.id);

		return (
			<View style={styles.distributorCard}>
				<View style={styles.distributorInfo}>
					<Text style={styles.distributorName}>{item.agencyName}</Text>
					<Text style={styles.distributorSap}>SAP: {item.sapCode}</Text>
					<Text style={styles.distributorAdmin}>Admin: {item.adminName}</Text>
					<View style={styles.distributorStatsContainer}>
						<Text style={styles.distributorStats}>
							Delivery Men: {item.deliveryMen?.length || 0} 
						</Text>
						<Text style={styles.distributorStats}>
							|
						</Text>
						<Text style={styles.distributorStats}>
							Inspections:{" "}
							{inspections.filter(
								(inspection) =>
									inspection?.distributorId?.sapCode === item?.sapCode
							)?.length || 0}
						</Text>
					</View>
					<Text style={styles.distributorStats}>
						Approved At:{" "}
						{new Date(item.updatedAt).toLocaleDateString("en-GB", {
							day: "2-digit",
							month: "short",
							year: "numeric",
						})}
					</Text>
				</View>
				<View style={styles.distributorActions}>
					{/* <TouchableOpacity
						style={styles.viewButton}
						onPress={() => handleViewDistributorData(item)}
					>
						<Ionicons name='eye' size={16} color='#FFFFFF' />
						<Text style={styles.viewButtonText}>View</Text>
					</TouchableOpacity> */}
					<TouchableOpacity
						style={[
							styles.exportButton,
							isExporting && styles.exportButtonDisabled,
						]}
						onPress={() => handleExportDistributorInspections(item)}
						disabled={isExporting}
					>
						{isExporting ? (
							<>
								<Ionicons name='hourglass' size={16} color='#FFFFFF' />
								<Text style={styles.exportButtonText}>Exporting...</Text>
							</>
						) : (
							<>
								<Ionicons name='download' size={16} color='#FFFFFF' />
								<Text style={styles.exportButtonText}>Export CSV</Text>
							</>
						)}
					</TouchableOpacity>
				</View>
			</View>
		);
	};

	const handleLogout = () => {
		Alert.alert("Logout", "Are you sure you want to logout?", [
			{ text: "Cancel", style: "cancel" },
			{ text: "Logout", onPress: logout },
		]);
	};

	if (loading) {
		return (
			<View>
				<LoadingIndicator />
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
						<Ionicons name='clipboard' size={24} color='#8B5CF6' />
						<Text style={styles.statNumber}>{inspections?.length || 0}</Text>
						<Text style={styles.statLabel}>Total Inspections</Text>
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

			{/* Distributor Details Modal */}
			<Modal
				visible={showDistributorModal}
				animationType='slide'
				transparent={true}
				onRequestClose={() => setShowDistributorModal(false)}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.distributorModalContent}>
						<View style={styles.distributorModalHeader}>
							<Text style={styles.distributorModalTitle}>
								{selectedDistributor?.agencyName} Details
							</Text>
							<TouchableOpacity
								onPress={() => setShowDistributorModal(false)}
								style={styles.closeModalButton}
							>
								<Ionicons name='close' size={24} color='#6B7280' />
							</TouchableOpacity>
						</View>

						{loadingDistributorData ? (
							<View style={styles.distributorModalLoading}>
								<LoadingIndicator />
								<Text style={styles.loadingText}>
									Loading distributor data...
								</Text>
							</View>
						) : (
							<ScrollView style={styles.distributorModalScroll}>
								<View style={styles.distributorDetailSection}>
									<Text style={styles.distributorDetailTitle}>Products</Text>
									<Text style={styles.distributorDetailValue}>
										{distributorData.products.length} products available
									</Text>
								</View>

								<View style={styles.distributorDetailSection}>
									<Text style={styles.distributorDetailTitle}>
										Delivery Men
									</Text>
									<Text style={styles.distributorDetailValue}>
										{distributorData.deliveryMen.length} delivery personnel
									</Text>
								</View>

								<View style={styles.distributorDetailSection}>
									<Text style={styles.distributorDetailTitle}>Inspections</Text>
									<Text style={styles.distributorDetailValue}>
										{distributorData.inspections.length} total inspections
									</Text>
								</View>

								<View style={styles.distributorDetailSection}>
									<Text style={styles.distributorDetailTitle}>
										App Settings
									</Text>
									<Text style={styles.distributorDetailValue}>
										{distributorData.appSettings
											? "Configured"
											: "Not configured"}
									</Text>
								</View>
							</ScrollView>
						)}
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
		marginTop: 8,
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
		marginBottom: 12,
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
	distributorStatsContainer: {
		flexDirection: "row",
		gap: 12,
		marginBottom: 12,
	},
	distributorStats: {
		fontSize: 12,
		color: "#9CA3AF",
	},
	distributorActions: {
		flexDirection: "row",
		gap: 8,
	},
	viewButton: {
		backgroundColor: "#5563EB",
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 6,
		flex: 1,
		justifyContent: "center",
	},
	viewButtonText: {
		color: "#FFFFFF",
		fontSize: 14,
		fontWeight: "500",
		marginLeft: 4,
	},
	exportButton: {
		backgroundColor: "#059669",
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 6,
		flex: 1,
		justifyContent: "center",
	},
	exportButtonDisabled: {
		backgroundColor: "#9CA3AF",
	},
	exportButtonText: {
		color: "#FFFFFF",
		fontSize: 14,
		fontWeight: "500",
		marginLeft: 4,
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
	// New styles for distributor details modal
	distributorModalContent: {
		backgroundColor: "#FFFFFF",
		borderRadius: 16,
		padding: 0,
		width: "95%",
		maxWidth: 500,
		maxHeight: "80%",
	},
	distributorModalHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 20,
		borderBottomWidth: 1,
		borderBottomColor: "#E5E7EB",
	},
	distributorModalTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#1F2937",
		flex: 1,
	},
	closeModalButton: {
		padding: 4,
	},
	distributorModalLoading: {
		padding: 40,
		alignItems: "center",
	},
	distributorModalScroll: {
		padding: 20,
	},
	distributorDetailSection: {
		marginBottom: 16,
		padding: 16,
		backgroundColor: "#F9FAFB",
		borderRadius: 8,
	},
	distributorDetailTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: "#1F2937",
		marginBottom: 4,
	},
	distributorDetailValue: {
		fontSize: 14,
		color: "#6B7280",
	},
});

export default SuperAdminDashboard;
