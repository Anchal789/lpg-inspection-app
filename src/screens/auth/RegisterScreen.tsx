"use client";

import { useState } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	Alert,
	KeyboardAvoidingView,
	Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";

const RegisterScreen = () => {
	const { sapCode, user } = useAuth();
	const [formData, setFormData] = useState({
		name: "",
		phone: "",
		password: "",
		sapCode: "",
	});

	const { refreshData } = useData();
	const [showPassword, setShowPassword] = useState(false);
	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(false);
	const navigation = useNavigation();
	// const route = useRoute();

	const { registerUser } = useAuth();

	const validateForm = () => {
		const newErrors = {};

		if (!formData.name.trim()) {
			newErrors.name = "Full name is required";
		} else if (formData.name.length < 3 || formData.name.length > 40) {
			newErrors.name = "Name must be 3-40 characters";
		}

		if (!formData.phone.trim()) {
			newErrors.phone = "Mobile number is required";
		} else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
			newErrors.phone = "Please enter a valid 10-digit Indian mobile number";
		}

		if (!formData.password.trim()) {
			newErrors.password = "Password is required";
		} else if (formData.password.length < 4) {
			newErrors.password = "Password must be at least 4 characters";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleRegister = async () => {
		if (!validateForm()) {
			return;
		}

		setLoading(true);
		try {
			const userData = {
				name: formData.name.trim(),
				phone: formData.phone,
				password: formData.password,
				role: "delivery",
				sapCode: sapCode || user?.sapCode, // Get SAP code from navigation params
			};

			const success = await registerUser(userData);
			if (success) {
				await refreshData()
				Alert.alert("Success", "User registered successfully!", [
					{
						text: "OK",
						onPress: () => {
							setFormData({
								name: "",
								phone: "",
								password: "",
								sapCode: "",
							});
							navigation.navigate("AdminDashboard");
						},
					},
				]);
			} else {
				Alert.alert("Error", "Registration failed. Please try again.");
			}
		} catch (error) {
			console.error("Registration error:", error);
			Alert.alert("Error", "Registration failed. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleInputChange = (field, value) => {
		setFormData({ ...formData, [field]: value });
		if (errors[field]) {
			const newErrors = { ...errors };
			delete newErrors[field];
			setErrors(newErrors);
		}
	};

	return (
		<View style={styles.container}>
			<KeyboardAvoidingView
				style={styles.content}
				behavior={Platform.OS === "ios" ? "padding" : "height"}
			>
				<View style={styles.titleContainer}>
					<Text style={styles.subtitle}>
						Create your account to get started
					</Text>
				</View>

				<View style={styles.formContainer}>
					<View style={styles.inputGroup}>
						<Text style={styles.label}>Full Name</Text>
						<TextInput
							style={[styles.input, errors.name && styles.inputError]}
							value={formData.name}
							onChangeText={(text) => handleInputChange("name", text)}
							placeholder='Enter your full name'
						/>
						{errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
					</View>

					<View style={styles.inputGroup}>
						<Text style={styles.label}>Mobile Number</Text>
						<TextInput
							style={[styles.input, errors.phone && styles.inputError]}
							value={formData.phone}
							onChangeText={(text) => handleInputChange("phone", text)}
							placeholder='Enter your mobile number'
							keyboardType='phone-pad'
							maxLength={10}
						/>
						{errors.phone && (
							<Text style={styles.errorText}>{errors.phone}</Text>
						)}
					</View>

					<View style={styles.inputGroup}>
						<Text style={styles.label}>Password</Text>
						<View style={styles.passwordContainer}>
							<TextInput
								style={[
									styles.passwordInput,
									errors.password && styles.inputError,
								]}
								value={formData.password}
								onChangeText={(text) => handleInputChange("password", text)}
								placeholder='Create a password'
								secureTextEntry={!showPassword}
							/>
							<TouchableOpacity
								style={styles.eyeButton}
								onPress={() => setShowPassword(!showPassword)}
							>
								<Ionicons
									name={showPassword ? "eye-off" : "eye"}
									size={20}
									color='#6B7280'
								/>
							</TouchableOpacity>
						</View>
						{errors.password && (
							<Text style={styles.errorText}>{errors.password}</Text>
						)}
					</View>

					<TouchableOpacity
						style={[styles.registerButton, loading && styles.buttonDisabled]}
						onPress={handleRegister}
						disabled={loading}
					>
						<Text style={styles.registerButtonText}>
							{loading ? "Registering..." : "Register"}
						</Text>
					</TouchableOpacity>
				</View>
			</KeyboardAvoidingView>
		</View>
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
	titleContainer: {
		alignItems: "center",
		marginBottom: 32,
	},
	title: {
		fontSize: 28,
		fontWeight: "bold",
		color: "#1F2937",
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 16,
		color: "#6B7280",
		textAlign: "center",
	},
	formContainer: {
		backgroundColor: "#FFFFFF",
		borderRadius: 16,
		padding: 24,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 4,
	},
	inputGroup: {
		marginBottom: 20,
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
	passwordContainer: {
		position: "relative",
	},
	passwordInput: {
		borderWidth: 1,
		borderColor: "#D1D5DB",
		borderRadius: 12,
		paddingHorizontal: 16,
		paddingVertical: 14,
		paddingRight: 50,
		fontSize: 16,
		backgroundColor: "#F9FAFB",
		color: "#1F2937",
	},
	eyeButton: {
		position: "absolute",
		right: 16,
		top: 14,
		padding: 4,
	},
	errorText: {
		color: "#EF4444",
		fontSize: 14,
		marginTop: 4,
	},
	registerButton: {
		backgroundColor: "#10B981",
		borderRadius: 12,
		paddingVertical: 16,
		alignItems: "center",
	},
	buttonDisabled: {
		opacity: 0.6,
	},
	registerButtonText: {
		color: "#FFFFFF",
		fontSize: 16,
		fontWeight: "600",
	},
});

export default RegisterScreen;
