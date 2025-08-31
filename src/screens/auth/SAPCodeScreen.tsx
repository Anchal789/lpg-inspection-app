"use client";

import { useState } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	Alert,
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
	Image,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import ApiService from "../../api/api-service";

const SAPCodeScreen = ({ navigation }) => {
	const [sapCode, setSapCodeForForm] = useState("");
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState<{ sapCode?: string }>({});
	const { setSapCode } = useAuth();

	const validateSapCode = (code) => {
		const newErrors: { sapCode?: string } = {};

		if (!code.trim()) {
			newErrors.sapCode = "SAP code is required";
		} else if (code.length < 5) {
			newErrors.sapCode = "SAP code must be at least 5 characters";
		} else if (code.length > 10) {
			newErrors.sapCode = "SAP code must not exceed 10 characters";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleContinue = async () => {
		if (!validateSapCode(sapCode)) {
			return;
		}

		setLoading(true);

		try {
			// Test connection first
			const connectionTest = await ApiService.testConnection();
			if (!connectionTest.success) {
				Alert.alert(
					"Connection Error",
					"Unable to connect to server. Please check your internet connection and try again.",
					[{ text: "OK" }]
				);
				setLoading(false);
				return;
			}

			// Validate SAP code with backend
			const response = await ApiService.validateSapCode(sapCode.trim());

			if (response.success) {
				// SAP code is valid, navigate to login
				setSapCode(sapCode.trim());
				navigation.navigate("Login", { sapCode: sapCode.trim() });
			} else {
				Alert.alert(
					"Invalid SAP Code",
					response.error ||
						"SAP code not found in database. Please contact admin.",
					[{ text: "OK" }]
				);
			}
		} catch (error) {
			console.error("SAP validation error:", error);
			Alert.alert("Error", "Failed to validate SAP code. Please try again.", [
				{ text: "OK" },
			]);
		} finally {
			setLoading(false);
		}
	};

	const handleRegister = () => {
		navigation.navigate("DistributorSignup");
	};

	return (
		<KeyboardAvoidingView
			style={styles.container}
			behavior={Platform.OS === "ios" ? "padding" : "height"}
		>
			<View style={styles.content}>
				{/* Logo Section */}
				<View style={styles.logoContainer}>
					<View style={styles.logoBackground}>
						<Image
							source={require("../../../assets/logo.png")} // replace with your image file
							style={styles.logoImage}
						/>
					</View>
					<Text style={styles.title}>Safe Kitchen</Text>
					<Text style={styles.subtitle}>
						Shaping Accident Free Environment For Kitchen
					</Text>
				</View>

				{/* Form Container */}
				<View style={styles.formContainer}>
					<View style={styles.inputContainer}>
						<Text style={styles.label}>Enter SAP Code</Text>
						<TextInput
							style={[styles.input, errors.sapCode && styles.inputError]}
							value={sapCode}
							onChangeText={(text) => {
								setSapCodeForForm(text.toUpperCase());
								if (errors.sapCode) {
									validateSapCode(text.toUpperCase());
								}
							}}
							placeholder='Enter your distributor SAP code'
							placeholderTextColor='#9CA3AF'
							autoCapitalize='characters'
							maxLength={10}
							editable={!loading}
						/>
						{errors.sapCode && (
							<Text style={styles.errorText}>{errors.sapCode}</Text>
						)}
					</View>

					<TouchableOpacity
						style={[styles.submitButton, loading && styles.buttonDisabled]}
						onPress={handleContinue}
						disabled={loading}
					>
						{loading ? (
							<ActivityIndicator color='#FFFFFF' size='small' />
						) : (
							<Text style={styles.submitButtonText}>Continue</Text>
						)}
					</TouchableOpacity>

					{/* Register link */}
					<TouchableOpacity
						style={styles.signupLink}
						onPress={handleRegister}
						disabled={loading}
					>
						<Text style={styles.signupText}>
							New Distributor?{" "}
							<Text style={styles.signupTextBold}>Sign Up here</Text>
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		</KeyboardAvoidingView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F8FAFC",
	},
	content: {
		flex: 1,
		justifyContent: "center",
		paddingHorizontal: 24,
	},
	logoContainer: {
		alignItems: "center",
		marginBottom: 48,
	},
	logoBackground: {
		width: 120,
		height: 120,
		borderRadius: 60,
		backgroundColor: "#2563EB00",
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 16,
	},
	logoImage: {
		width: 120, // adjust the size as needed
		height: 120, // adjust the size as needed
		resizeMode: "contain", // or 'cover' depending on your needs
	},
	title: {
		fontSize: 40,
		fontWeight: "bold",
		color: "#1F2937",
		textAlign: "center",
		marginBottom: 8,
		// textShadowColor: "#00000040", // add this
		// textShadowOffset: { width: 0, height: 2 }, // add this
		// textShadowRadius: 2, // add this
	},
	subtitle: {
		fontSize: 16,
		// backgroundColor: "#2563EB",
		// color: "#FFFFFF",
		paddingVertical: 1,
		paddingHorizontal: 5,
		textAlign: "center",
	},
	formContainer: {
		backgroundColor: "#FFFFFF",
		borderRadius: 16,
		padding: 24,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 4,
	},
	inputContainer: {
		marginBottom: 24,
	},
	label: {
		fontSize: 16,
		fontWeight: "600",
		color: "#374151",
		marginBottom: 8,
	},
	input: {
		borderWidth: 1,
		borderColor: "#D1D5DB",
		borderRadius: 12,
		paddingHorizontal: 16,
		paddingVertical: 14,
		fontSize: 16,
		backgroundColor: "#F9FAFB",
		color: "#1F2937",
	},
	inputError: {
		borderColor: "#EF4444",
		backgroundColor: "#FEF2F2",
	},
	errorText: {
		color: "#EF4444",
		fontSize: 14,
		marginTop: 8,
		fontWeight: "500",
	},
	submitButton: {
		backgroundColor: "#2563EB",
		borderRadius: 12,
		paddingVertical: 16,
		alignItems: "center",
		marginBottom: 16,
		shadowColor: "#2563EB",
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.2,
		shadowRadius: 8,
		elevation: 4,
	},
	buttonDisabled: {
		backgroundColor: "#9CA3AF",
		shadowOpacity: 0,
		elevation: 0,
	},
	submitButtonText: {
		color: "#FFFFFF",
		fontSize: 16,
		fontWeight: "600",
	},
	signupLink: {
		alignItems: "center",
		paddingVertical: 8,
	},
	signupText: {
		fontSize: 14,
		color: "#6B7280",
	},
	signupTextBold: {
		color: "#2563EB",
		fontWeight: "600",
	},
});

export default SAPCodeScreen;
