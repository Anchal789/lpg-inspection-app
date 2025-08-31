"use client";

import { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	TouchableOpacity,
	TextInput,
	Modal,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useData } from "../../context/DataContext";

const DeliveryManDetails = () => {
	const route = useRoute();
	const navigation = useNavigation();
	const { inspections } = useData();
	const [showFilters, setShowFilters] = useState(false);

	const deliveryMan = (route.params as any)?.deliveryMan;

	const [nameFilter, setNameFilter] = useState("");
	const [dateFilter, setDateFilter] = useState("");
	const [consumerNumberFilter, setConsumerNumberFilter] = useState("");

	const inspectionsByDeliveryMan = inspections?.filter(
		(inspection) => inspection.deliveryManId === deliveryMan.id
	);

	const filteredInspections = inspectionsByDeliveryMan.filter((inspection) => {
		const nameMatch = inspection.consumerName
			.toLowerCase()
			.includes(nameFilter.toLowerCase());
		const dateMatch = dateFilter ? inspection.date.includes(dateFilter) : true;
		const consumerNumberMatch = consumerNumberFilter
			? inspection.consumerNumber.includes(consumerNumberFilter)
			: true;
		return nameMatch && dateMatch && consumerNumberMatch;
	});

	const renderInspection = ({ item }: { item: any }) => (
		<TouchableOpacity
			style={styles.inspectionCard}
			onPress={() =>
				navigation.navigate(
					"InspectionDetails" as never,
					{ inspection: item } as never
				)
			}
		>
			<View style={styles.inspectionInfo}>
				<Text style={styles.consumerName}>{item.consumerName}</Text>
				<Text style={styles.consumerNumber}>
					Consumer: {item.consumerNumber}
				</Text>
				<Text style={styles.inspectionDate}>
					{new Date(item.date).toLocaleDateString()} at{" "}
					{new Date(item.date).toLocaleTimeString()}
				</Text>
				<Text style={styles.inspectionAmount}>Amount: ₹{item.totalAmount}</Text>
			</View>
			<View style={styles.detailButton}>
				<Text style={styles.detailButtonText}>👁️</Text>
			</View>
		</TouchableOpacity>
	);

	return (
		<View style={styles.container}>
			{/* Delivery Man Info */}
			<View style={styles.header}>
				<View style={styles.searchHeader}>
					<Text style={styles.deliveryManName}>{deliveryMan.name}</Text>
					<TouchableOpacity
						style={styles.filterButton}
						onPress={() => setShowFilters(true)}
					>
						<Text style={styles.filterButtonText}>🔍</Text>
					</TouchableOpacity>
				</View>
				<Text style={styles.deliveryManStats}>
					Total Inspections: {deliveryMan.totalInspections} | Total Sales: ₹
					{deliveryMan.totalSales.toLocaleString()}
				</Text>
			</View>

			{/* Inspections List */}
			<FlatList
				data={filteredInspections}
				renderItem={renderInspection}
				keyExtractor={(item) => item.id}
				contentContainerStyle={styles.listContainer}
				showsVerticalScrollIndicator={false}
				ListEmptyComponent={() => (
					<View style={styles.emptyContainer}>
						<Text style={styles.emptyText}>No inspections found</Text>
					</View>
				)}
			/>

			<Modal
				visible={showFilters}
				animationType='slide'
				transparent={true}
				onRequestClose={() => setShowFilters(false)}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>Filter Inspections</Text>

						{/* Filters */}
						<View style={styles.filtersContainer}>
							<TextInput
								style={styles.filterInput}
								placeholder='Filter by consumer name'
								value={nameFilter}
								onChangeText={setNameFilter}
							/>
							<TextInput
								style={styles.filterInput}
								placeholder='Filter by date (YYYY-MM-DD)'
								value={dateFilter}
								onChangeText={setDateFilter}
							/>
							<TextInput
								style={styles.filterInput}
								placeholder='Filter by date consumer number'
								value={consumerNumberFilter}
								onChangeText={setConsumerNumberFilter}
							/>
						</View>
						<View style={styles.modalButtons}>
							<TouchableOpacity
								style={styles.cancelButton}
								onPress={() => setShowFilters(false)}
							>
								<Text style={styles.cancelButtonText}>Cancel</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={styles.applyButton}
								onPress={() => setShowFilters(false)}
							>
								<Text style={styles.applyButtonText}>Apply</Text>
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
	searchHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		backgroundColor: "#FFFFFF",
		padding: 20,
		// borderBottomWidth: 1,
		// borderBottomColor: "#E5E7EB",
	},
	title: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#1F2937",
	},
	filterButton: {
		backgroundColor: "#2563EB",
		borderRadius: 20,
		width: 40,
		height: 40,
		justifyContent: "center",
		alignItems: "center",
	},
	filterButtonText: {
		fontSize: 16,
	},
	emptyContainer: {
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 40,
	},
	emptyText: {
		fontSize: 16,
		color: "#6B7280",
	},
	header: {
		backgroundColor: "#FFFFFF",
		padding: 20,
		borderBottomWidth: 1,
		borderBottomColor: "#E5E7EB",
	},
	deliveryManName: {
		fontSize: 22,
		fontWeight: "bold",
		color: "#1F2937",
		marginBottom: 8,
	},
	deliveryManStats: {
		fontSize: 14,
		textAlign: "center",
		marginTop: 8,
		color: "#6B7280",
	},
	filtersContainer: {
		backgroundColor: "#FFFFFF",
		padding: 16,
		borderBottomWidth: 1,
		borderBottomColor: "#E5E7EB",
	},
	filterInput: {
		borderWidth: 1,
		borderColor: "#D1D5DB",
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 10,
		fontSize: 14,
		backgroundColor: "#F9FAFB",
		marginBottom: 8,
	},
	listContainer: {
		padding: 16,
	},
	inspectionCard: {
		backgroundColor: "#FFFFFF",
		borderRadius: 12,
		padding: 16,
		marginBottom: 12,
		flexDirection: "row",
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	inspectionInfo: {
		flex: 1,
	},
	consumerName: {
		fontSize: 16,
		fontWeight: "600",
		color: "#1F2937",
		marginBottom: 4,
	},
	consumerNumber: {
		fontSize: 14,
		color: "#6B7280",
		marginBottom: 2,
	},
	inspectionDate: {
		fontSize: 12,
		color: "#6B7280",
		marginBottom: 2,
	},
	inspectionAmount: {
		fontSize: 14,
		color: "#10B981",
		fontWeight: "500",
	},
	detailButton: {
		backgroundColor: "#2563EB",
		borderRadius: 20,
		width: 40,
		height: 40,
		justifyContent: "center",
		alignItems: "center",
	},
	detailButtonText: {
		fontSize: 16,
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
		marginBottom: 20,
		textAlign: "center",
	},
	modalButtons: {
		flexDirection: "row",
		gap: 12,
		marginTop: 8,
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
	applyButton: {
		flex: 1,
		backgroundColor: "#2563EB",
		borderRadius: 8,
		paddingVertical: 12,
		alignItems: "center",
	},
	applyButtonText: {
		color: "#FFFFFF",
		fontSize: 16,
		fontWeight: "600",
	},
});

export default DeliveryManDetails;
