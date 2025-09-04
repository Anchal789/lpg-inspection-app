import { View, Text, FlatList, TouchableOpacity, Alert } from "react-native";
import { useInspections } from "../hooks/useDatabase";
import LoadingIndicator from "./Loader";

const DatabaseExample = ({ deliveryManId }: { deliveryManId: string }) => {
	const { inspections, loading, error, createInspection } =
		useInspections(deliveryManId);

	// Example: Create a new inspection
	const handleCreateInspection = async () => {
		const sampleInspection = {
			distributorId: "distributor_id_here",
			deliveryManId: deliveryManId,
			consumer: {
				name: "John Doe",
				consumerNumber: "LPG001234",
				mobileNumber: "+91 9479335528",
				address: "123 Main Street, City",
			},
			safetyQuestions: [
				{
					questionId: 0,
					question: "Is cylinder in good condition?",
					answer: "yes",
				},
				{
					questionId: 1,
					question: "Is valve working properly?",
					answer: "yes",
				},
				// ... more questions
			],
			images: [
				{
					imageId: "img_001",
					imageUrl: "https://your-storage.com/image1.jpg",
					uploadedAt: new Date(),
					fileSize: 245760, // bytes
				},
			],
			products: [
				{
					productId: "product_id_here",
					name: "Gas Cylinder",
					price: 850,
					quantity: 1,
					subtotal: 850,
				},
			],
			location: {
				latitude: 12.9716,
				longitude: 77.5946,
				address: "Bangalore, Karnataka",
				accuracy: 10,
			},
			totalAmount: 850,
			status: "completed",
			passedQuestions: 12,
			failedQuestions: 0,
			inspectionDate: new Date(),
		};

		try {
			const result = await createInspection(sampleInspection);
			Alert.alert("Success", "Inspection created successfully!");
		} catch (error) {
			Alert.alert("Error", error.message);
		}
	};

	if (loading) {
		return (
			<View>
				<LoadingIndicator />
			</View>
		);
	}

	if (error) {
		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<Text>Error: {error}</Text>
			</View>
		);
	}

	return (
		<View style={{ flex: 1, padding: 16 }}>
			<TouchableOpacity
				style={{
					backgroundColor: "#10B981",
					padding: 12,
					borderRadius: 8,
					marginBottom: 16,
					alignItems: "center",
				}}
				onPress={handleCreateInspection}
			>
				<Text style={{ color: "white", fontWeight: "bold" }}>
					Create Sample Inspection
				</Text>
			</TouchableOpacity>

			<FlatList
				data={inspections}
				keyExtractor={(item) => item._id}
				renderItem={({ item }) => (
					<View
						style={{
							backgroundColor: "white",
							padding: 16,
							marginBottom: 8,
							borderRadius: 8,
							shadowColor: "#000",
							shadowOffset: { width: 0, height: 2 },
							shadowOpacity: 0.1,
							shadowRadius: 4,
							elevation: 3,
						}}
					>
						<Text style={{ fontSize: 16, fontWeight: "bold" }}>
							{item.consumer.name}
						</Text>
						<Text style={{ color: "#666" }}>
							Consumer: {item.consumer.consumerNumber}
						</Text>
						<Text style={{ color: "#10B981", fontWeight: "bold" }}>
							₹{item.totalAmount}
						</Text>
						<Text style={{ fontSize: 12, color: "#999" }}>
							{new Date(item.inspectionDate).toLocaleDateString()}
						</Text>
					</View>
				)}
				ListEmptyComponent={
					<Text style={{ textAlign: "center", color: "#666", marginTop: 32 }}>
						No inspections found
					</Text>
				}
			/>
		</View>
	);
};

export default DatabaseExample;
