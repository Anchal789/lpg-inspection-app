import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TextInput,
	TouchableOpacity,
	Alert,
	ActivityIndicator,
	SafeAreaView,
} from "react-native";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";

const AppSettingsScreen = ({ navigation }) => {
	const { appSettings, updateAppSettings, resetAppSettings, loading } =
		useData();
	const { user } = useAuth();

	const [settings, setSettings] = useState({
		hotplateName: "",
		hotplatePrice: "",
		portablePlatformName: "",
		portablePlatformPrice: "",
		hotplateExchangeRate: "",
	});

	const [isLoading, setIsLoading] = useState(false);
	const [hasChanges, setHasChanges] = useState(false);

	// Initialize settings when appSettings loads
	useEffect(() => {
		if (appSettings) {
			setSettings({
				hotplateName: appSettings.hotplateName || "",
				hotplatePrice: appSettings.hotplatePrice?.toString() || "",
				portablePlatformName: appSettings.portablePlatformName || "",
				portablePlatformPrice:
					appSettings.portablePlatformPrice?.toString() || "",
				hotplateExchangeRate:
					appSettings.hotplateExchangeRate?.toString() || "",
			});
		}
	}, [appSettings]);

	// Check if settings have changed
	useEffect(() => {
		if (appSettings) {
			const changed =
				settings.hotplateName !== appSettings.hotplateName ||
				parseFloat(settings.hotplatePrice) !== appSettings.hotplatePrice ||
				settings.portablePlatformName !== appSettings.portablePlatformName ||
				parseFloat(settings.portablePlatformPrice) !==
					appSettings.portablePlatformPrice ||
				parseFloat(settings.hotplateExchangeRate) !==
					appSettings.hotplateExchangeRate;

			setHasChanges(changed);
		}
	}, [settings, appSettings]);

	const handleInputChange = (field, value) => {
		setSettings((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const validateSettings = () => {
		const errors = [];

		if (!settings.hotplateName.trim()) {
			errors.push("Hotplate name is required");
		}

		if (!settings.portablePlatformName.trim()) {
			errors.push("Portable platform name is required");
		}

		const hotplatePrice = parseFloat(settings.hotplatePrice);
		if (isNaN(hotplatePrice) || hotplatePrice <= 0) {
			errors.push("Hotplate price must be a valid positive number");
		}

		const portablePlatformPrice = parseFloat(settings.portablePlatformPrice);
		if (isNaN(portablePlatformPrice) || portablePlatformPrice <= 0) {
			errors.push("Portable platform price must be a valid positive number");
		}

		const exchangeRate = parseFloat(settings.hotplateExchangeRate);
		if (isNaN(exchangeRate) || exchangeRate <= 0) {
			errors.push("Hotplate exchange rate must be a valid positive number");
		}

		return errors;
	};

	const handleSave = async () => {
		const validationErrors = validateSettings();

		if (validationErrors.length > 0) {
			Alert.alert("Validation Error", validationErrors.join("\n"), [
				{ text: "OK" },
			]);
			return;
		}

		if (!user?.distributorId) {
			Alert.alert("Error", "Distributor information not found");
			return;
		}

		try {
			setIsLoading(true);

			const settingsData = {
				hotplateName: settings.hotplateName.trim(),
				hotplatePrice: parseFloat(settings.hotplatePrice),
				portablePlatformName: settings.portablePlatformName.trim(),
				portablePlatformPrice: parseFloat(settings.portablePlatformPrice),
				hotplateExchangeRate: parseFloat(settings.hotplateExchangeRate),
			};

			const response = await updateAppSettings(settingsData);

			if (response && response.success !== false) {
				Alert.alert("Success", "App settings updated successfully!", [
					{ text: "OK" },
				]);
				setHasChanges(false);
			} else {
				throw new Error(response?.error || "Failed to update settings");
			}
		} catch (error) {
			console.error("Error saving settings:", error);
			Alert.alert(
				"Error",
				error.message || "Failed to save settings. Please try again.",
				[{ text: "OK" }]
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleReset = () => {
		Alert.alert(
			"Reset Settings",
			"Are you sure you want to reset all settings to default values?",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Reset",
					style: "destructive",
					onPress: async () => {
						try {
							setIsLoading(true);
							const response = await resetAppSettings();

							if (response && response.success !== false) {
								Alert.alert("Success", "Settings reset to default values!", [
									{ text: "OK" },
								]);
							} else {
								throw new Error(response?.error || "Failed to reset settings");
							}
						} catch (error) {
							console.error("Error resetting settings:", error);
							Alert.alert(
								"Error",
								"Failed to reset settings. Please try again.",
								[{ text: "OK" }]
							);
						} finally {
							setIsLoading(false);
						}
					},
				},
			]
		);
	};

	if (loading) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size='large' color='#007bff' />
					<Text style={styles.loadingText}>Loading settings...</Text>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Product Configuration</Text>

					{/* Hotplate Settings */}
					<View style={styles.card}>
						<Text style={styles.cardTitle}>Hotplate Settings</Text>

						<View style={styles.inputGroup}>
							<Text style={styles.label}>Product Name</Text>
							<TextInput
								style={styles.input}
								value={settings.hotplateName}
								onChangeText={(value) =>
									handleInputChange("hotplateName", value)
								}
								placeholder='Enter hotplate name'
								placeholderTextColor='#999'
							/>
						</View>

						<View style={styles.inputGroup}>
							<Text style={styles.label}>Price (₹)</Text>
							<TextInput
								style={styles.input}
								value={settings.hotplatePrice}
								onChangeText={(value) =>
									handleInputChange("hotplatePrice", value)
								}
								placeholder='Enter hotplate price'
								placeholderTextColor='#999'
								keyboardType='numeric'
							/>
						</View>

						<View style={styles.inputGroup}>
							<Text style={styles.label}>Exchange Rate (₹)</Text>
							<TextInput
								style={styles.input}
								value={settings.hotplateExchangeRate}
								onChangeText={(value) =>
									handleInputChange("hotplateExchangeRate", value)
								}
								placeholder='Enter exchange rate'
								placeholderTextColor='#999'
								keyboardType='numeric'
							/>
							<Text style={styles.helpText}>
								Amount charged for hotplate exchange
							</Text>
						</View>
					</View>

					{/* Portable Platform Settings */}
					<View style={styles.card}>
						<Text style={styles.cardTitle}>Portable Platform Settings</Text>

						<View style={styles.inputGroup}>
							<Text style={styles.label}>Product Name</Text>
							<TextInput
								style={styles.input}
								value={settings.portablePlatformName}
								onChangeText={(value) =>
									handleInputChange("portablePlatformName", value)
								}
								placeholder='Enter portable platform name'
								placeholderTextColor='#999'
							/>
						</View>

						<View style={styles.inputGroup}>
							<Text style={styles.label}>Price (₹)</Text>
							<TextInput
								style={styles.input}
								value={settings.portablePlatformPrice}
								onChangeText={(value) =>
									handleInputChange("portablePlatformPrice", value)
								}
								placeholder='Enter portable platform price'
								placeholderTextColor='#999'
								keyboardType='numeric'
							/>
						</View>
					</View>
				</View>

				{/* Preview Section */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Settings Preview</Text>
					<View style={styles.previewCard}>
						<View style={styles.previewRow}>
							<Text style={styles.previewLabel}>Hotplate:</Text>
							<Text style={styles.previewValue}>
								{settings.hotplateName || "Not set"} - ₹
								{settings.hotplatePrice || "0"}
							</Text>
						</View>
						<View style={styles.previewRow}>
							<Text style={styles.previewLabel}>Platform:</Text>
							<Text style={styles.previewValue}>
								{settings.portablePlatformName || "Not set"} - ₹
								{settings.portablePlatformPrice || "0"}
							</Text>
						</View>
						<View style={styles.previewRow}>
							<Text style={styles.previewLabel}>Exchange Rate:</Text>
							<Text style={styles.previewValue}>
								₹{settings.hotplateExchangeRate || "0"}
							</Text>
						</View>
					</View>
				</View>

				{/* Action Buttons - Now inside ScrollView */}
				<View style={styles.actionButtons}>
					<TouchableOpacity
						style={styles.resetButton}
						onPress={handleReset}
						disabled={isLoading}
					>
						<Text style={styles.resetButtonText}>Reset to Default</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={[
							styles.saveButton,
							(!hasChanges || isLoading) && styles.saveButtonDisabled,
						]}
						onPress={handleSave}
						disabled={!hasChanges || isLoading}
					>
						{isLoading ? (
							<ActivityIndicator size='small' color='#fff' />
						) : (
							<Text style={styles.saveButtonText}>Save Changes</Text>
						)}
					</TouchableOpacity>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f5f5",
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	loadingText: {
		marginTop: 10,
		fontSize: 16,
		color: "#666",
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 12,
		backgroundColor: "#fff",
		borderBottomWidth: 1,
		borderBottomColor: "#e0e0e0",
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
	},
	backButton: {
		padding: 8,
	},
	backButtonText: {
		fontSize: 16,
		color: "#007bff",
		fontWeight: "500",
	},
	headerTitle: {
		flex: 1,
		fontSize: 18,
		fontWeight: "bold",
		textAlign: "center",
		color: "#333",
	},
	headerSpacer: {
		width: 60,
	},
	content: {
		flex: 1,
		padding: 16,
	},
	section: {
		marginBottom: 24,
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#333",
		marginBottom: 16,
	},
	card: {
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 20,
		marginBottom: 16,
		elevation: 3,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
	},
	cardTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#333",
		marginBottom: 16,
	},
	inputGroup: {
		marginBottom: 16,
	},
	label: {
		fontSize: 14,
		fontWeight: "500",
		color: "#555",
		marginBottom: 8,
	},
	input: {
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
		backgroundColor: "#fafafa",
		color: "#333",
	},
	helpText: {
		fontSize: 12,
		color: "#666",
		marginTop: 4,
		fontStyle: "italic",
	},
	previewCard: {
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 20,
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
	},
	previewRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 8,
		borderBottomWidth: 1,
		borderBottomColor: "#f0f0f0",
	},
	previewLabel: {
		fontSize: 14,
		color: "#666",
		fontWeight: "500",
	},
	previewValue: {
		fontSize: 14,
		color: "#333",
		fontWeight: "600",
		flex: 1,
		textAlign: "right",
	},
	actionButtons: {
		flexDirection: "column",
		padding: 16,
		gap: 12,
		marginBottom: 20,
	},
	resetButton: {
		backgroundColor: "#dc3545",
		borderRadius: 8,
		paddingVertical: 14,
		alignItems: "center",
	},
	resetButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
	saveButton: {
		backgroundColor: "#007bff",
		borderRadius: 8,
		paddingVertical: 14,
		alignItems: "center",
		justifyContent: "center",
	},
	saveButtonDisabled: {
		backgroundColor: "#ccc",
	},
	saveButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
});

export default AppSettingsScreen;