"use client";

import { useState, useContext } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	Alert,
	Modal,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../context/AuthContext";
import ApiService from "../../api/api-service";

const LoginScreen = () => {
	const [phone, setPhone] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState({});

	// Forget Password Modal States
	const [forgetPasswordModal, setForgetPasswordModal] = useState(false);
	const [resetPhone, setResetPhone] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [resetLoading, setResetLoading] = useState(false);
	const [resetErrors, setResetErrors] = useState({});
	const [resetSuccess, setResetSuccess] = useState(false);

	const navigation = useNavigation();
	const route = useRoute();
	const { login } = useContext(AuthContext);

	const { sapCode, distributorData } = route.params;

	const validatePhone = (phoneNumber) => {
		if (!phoneNumber) {
			return "Phone number is required";
		}
		if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
			return "Please enter a valid 10-digit Indian mobile number";
		}
		return "";
	};

	const validatePassword = (pwd) => {
		if (!pwd) {
			return "Password is required";
		}
		if (pwd.length < 4) {
			return "Password must be at least 4 characters";
		}
		return "";
	};

	const handleLogin = async () => {
		const phoneError = validatePhone(phone);
		const passwordError = validatePassword(password);

		const newErrors = {};
		if (phoneError) newErrors.phone = phoneError;
		if (passwordError) newErrors.password = passwordError;

		setErrors(newErrors);

		if (Object.keys(newErrors).length > 0) {
			return;
		}

		setLoading(true);

		try {
			const response = await ApiService.login(phone, password, sapCode);

			if (response.success) {
				if (!response.data.user.isActive && response.data.user.role === "delivery") {
					let message =
						"Your account has been deactivated. Please contact the administrator.";

					// Customize message for delivery users
					if (response.data.user.role === "delivery") {
						message =
							"Your account has been deactivated. Please contact the agency owner.";
					}

					Alert.alert("Account Deactivated", message);
					return; // Stop execution here - no navigation
				}

				await login(response.data.user, response.data.token);

				// Navigate based on user role
				switch (response.data.user.role) {
					case "super_admin":
						navigation.reset({
							index: 0,
							routes: [{ name: "SuperAdminDashboard" }],
						});
						break;
					case "admin":
						navigation.reset({
							index: 0,
							routes: [{ name: "AdminDashboard" }],
						});
						break;
					case "delivery":
						navigation.reset({
							index: 0,
							routes: [{ name: "DeliveryDashboard" }],
						});
						break;
					default:
						Alert.alert("Error", "Unknown user role");
				}
			} else {
				console.log("❌ Login failed:", response.error);
				Alert.alert("Login Failed", response.error || "Invalid credentials");
			}
		} catch (error) {
			console.error("❌ Login error:", error);
			Alert.alert("Error", error.message || "Login failed. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleForgetPassword = () => {
		setForgetPasswordModal(true);
		setResetPhone("");
		setNewPassword("");
		setConfirmPassword("");
		setResetErrors({});
		setResetSuccess(false);
	};

	const validateResetForm = () => {
		const newErrors = {};

		const phoneError = validatePhone(resetPhone);
		if (phoneError) newErrors.phone = phoneError;

		const passwordError = validatePassword(newPassword);
		if (passwordError) newErrors.password = passwordError;

		if (!confirmPassword) {
			newErrors.confirmPassword = "Please confirm your password";
		} else if (newPassword !== confirmPassword) {
			newErrors.confirmPassword = "Passwords do not match";
		}

		setResetErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleResetPassword = async () => {
		if (!validateResetForm()) {
			return;
		}

		setResetLoading(true);

		try {
			console.log("🔄 Attempting password reset for:", {
				phone: resetPhone,
				sapCode,
			});
			const response = await ApiService.resetPassword(
				resetPhone,
				newPassword,
				sapCode
			);

			if (response.success) {
				console.log("✅ Password reset successful");
				setResetSuccess(true);
			} else {
				console.log("❌ Password reset failed:", response.error);
				Alert.alert(
					"Reset Failed",
					response.error || "Failed to reset password"
				);
			}
		} catch (error) {
			console.error("❌ Password reset error:", error);
			Alert.alert(
				"Error",
				error.message || "Password reset failed. Please try again."
			);
		} finally {
			setResetLoading(false);
		}
	};

	const closeResetModal = () => {
		setForgetPasswordModal(false);
		setResetPhone("");
		setNewPassword("");
		setConfirmPassword("");
		setResetErrors({});
		setResetSuccess(false);
	};

	const handleBack = () => {
		navigation.goBack();
	};

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity style={styles.backButton} onPress={handleBack}>
					<Ionicons name='arrow-back' size={24} color='#FFFFFF' />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Login</Text>
			</View>
			<View style={styles.content}>
				<View style={styles.titleSection}>
					<Text style={styles.title}>Welcome Back</Text>
					<Text style={styles.subtitle}>Sign in to continue</Text>
				</View>

				<View style={styles.formCard}>
					<View style={styles.inputGroup}>
						<Text style={styles.label}>Phone Number</Text>
						<TextInput
							style={[styles.input, errors.phone && styles.inputError]}
							value={phone}
							onChangeText={(text) => {
								setPhone(text);
								if (errors.phone) {
									const newErrors = { ...errors };
									delete newErrors.phone;
									setErrors(newErrors);
								}
							}}
							placeholder='Enter your phone number'
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
								value={password}
								onChangeText={(text) => {
									setPassword(text);
									if (errors.password) {
										const newErrors = { ...errors };
										delete newErrors.password;
										setErrors(newErrors);
									}
								}}
								placeholder='Enter your password'
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
						style={[styles.signInButton, loading && styles.buttonDisabled]}
						onPress={handleLogin}
						disabled={loading}
					>
						<Text style={styles.signInButtonText}>
							{loading ? "Signing in..." : "Sign In"}
						</Text>
					</TouchableOpacity>

					<View style={styles.registerForgetPass}>
						{/* {sapCode !== "000000" && (
							<TouchableOpacity onPress={() => navigation.navigate("Register")}>
								<Text style={styles.registerLink}>Register a new user</Text>
							</TouchableOpacity>
						)} */}
						<TouchableOpacity onPress={handleForgetPassword}>
							<Text style={styles.forgetPasswordLink}>Forget Password?</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>

			{/* Forget Password Modal */}
			<Modal
				visible={forgetPasswordModal}
				animationType='slide'
				transparent={true}
				onRequestClose={closeResetModal}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						{!resetSuccess ? (
							<>
								<View style={styles.modalHeader}>
									<Text style={styles.modalTitle}>Reset Password</Text>
									<TouchableOpacity
										style={styles.closeButton}
										onPress={closeResetModal}
									>
										<Ionicons name='close' size={24} color='#6B7280' />
									</TouchableOpacity>
								</View>

								<Text style={styles.modalSubtitle}>
									SAP Code: <Text style={styles.sapCodeText}>{sapCode}</Text>
								</Text>

								<View style={styles.modalInputGroup}>
									<Text style={styles.modalLabel}>Phone Number</Text>
									<TextInput
										style={[
											styles.modalInput,
											resetErrors.phone && styles.inputError,
										]}
										value={resetPhone}
										onChangeText={(text) => {
											setResetPhone(text);
											if (resetErrors.phone) {
												const newErrors = { ...resetErrors };
												delete newErrors.phone;
												setResetErrors(newErrors);
											}
										}}
										placeholder='Enter your phone number'
										keyboardType='phone-pad'
										maxLength={10}
									/>
									{resetErrors.phone && (
										<Text style={styles.errorText}>{resetErrors.phone}</Text>
									)}
								</View>

								<View style={styles.modalInputGroup}>
									<Text style={styles.modalLabel}>New Password</Text>
									<View style={styles.passwordContainer}>
										<TextInput
											style={[
												styles.modalPasswordInput,
												resetErrors.password && styles.inputError,
											]}
											value={newPassword}
											onChangeText={(text) => {
												setNewPassword(text);
												if (resetErrors.password) {
													const newErrors = { ...resetErrors };
													delete newErrors.password;
													setResetErrors(newErrors);
												}
											}}
											placeholder='Enter new password'
											secureTextEntry={!showNewPassword}
										/>
										<TouchableOpacity
											style={styles.eyeButton}
											onPress={() => setShowNewPassword(!showNewPassword)}
										>
											<Ionicons
												name={showNewPassword ? "eye-off" : "eye"}
												size={20}
												color='#6B7280'
											/>
										</TouchableOpacity>
									</View>
									{resetErrors.password && (
										<Text style={styles.errorText}>{resetErrors.password}</Text>
									)}
								</View>

								<View style={styles.modalInputGroup}>
									<Text style={styles.modalLabel}>Confirm Password</Text>
									<View style={styles.passwordContainer}>
										<TextInput
											style={[
												styles.modalPasswordInput,
												resetErrors.confirmPassword && styles.inputError,
											]}
											value={confirmPassword}
											onChangeText={(text) => {
												setConfirmPassword(text);
												if (resetErrors.confirmPassword) {
													const newErrors = { ...resetErrors };
													delete newErrors.confirmPassword;
													setResetErrors(newErrors);
												}
											}}
											placeholder='Confirm new password'
											secureTextEntry={!showConfirmPassword}
										/>
										<TouchableOpacity
											style={styles.eyeButton}
											onPress={() =>
												setShowConfirmPassword(!showConfirmPassword)
											}
										>
											<Ionicons
												name={showConfirmPassword ? "eye-off" : "eye"}
												size={20}
												color='#6B7280'
											/>
										</TouchableOpacity>
									</View>
									{resetErrors.confirmPassword && (
										<Text style={styles.errorText}>
											{resetErrors.confirmPassword}
										</Text>
									)}
								</View>

								<View style={styles.modalButtons}>
									<TouchableOpacity
										style={styles.cancelButton}
										onPress={closeResetModal}
									>
										<Text style={styles.cancelButtonText}>Cancel</Text>
									</TouchableOpacity>
									<TouchableOpacity
										style={[
											styles.resetButton,
											resetLoading && styles.buttonDisabled,
										]}
										onPress={handleResetPassword}
										disabled={resetLoading}
									>
										<Text style={styles.resetButtonText}>
											{resetLoading ? "Resetting..." : "Reset Password"}
										</Text>
									</TouchableOpacity>
								</View>
							</>
						) : (
							<>
								<View style={styles.successContainer}>
									<Ionicons name='checkmark-circle' size={64} color='#10B981' />
									<Text style={styles.successTitle}>
										Password Reset Successfully!
									</Text>
									<Text style={styles.successMessage}>
										Your password has been updated successfully. You can now
										login with your new password.
									</Text>
									<TouchableOpacity
										style={styles.loginButton}
										onPress={closeResetModal}
									>
										<Text style={styles.loginButtonText}>Back to Login</Text>
									</TouchableOpacity>
								</View>
							</>
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
	header: {
		backgroundColor: "#2563eb",
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingTop: 50,
		paddingBottom: 16,
	},
	backButton: {
		padding: 8,
		marginRight: 8,
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: "600",
		color: "#FFFFFF",
	},
	content: {
		flex: 1,
		justifyContent: "center",
		paddingHorizontal: 20,
	},
	titleSection: {
		alignItems: "center",
		marginBottom: 60,
	},
	title: {
		fontSize: 28,
		fontWeight: "bold",
		color: "#1F2937",
		textAlign: "center",
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 16,
		color: "#6B7280",
		textAlign: "center",
	},
	formCard: {
		backgroundColor: "#FFFFFF",
		borderRadius: 16,
		padding: 24,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 5,
	},
	inputGroup: {
		marginBottom: 20,
	},
	label: {
		fontSize: 14,
		fontWeight: "500",
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
	},
	inputError: {
		borderColor: "#EF4444",
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
	},
	eyeButton: {
		position: "absolute",
		right: 16,
		top: 14,
		padding: 4,
	},
	errorText: {
		color: "#EF4444",
		fontSize: 12,
		marginTop: 4,
	},
	signInButton: {
		backgroundColor: "#2563eb",
		paddingVertical: 16,
		borderRadius: 12,
		alignItems: "center",
		marginBottom: 20,
	},
	buttonDisabled: {
		opacity: 0.6,
	},
	signInButtonText: {
		color: "#FFFFFF",
		fontSize: 16,
		fontWeight: "600",
	},
	registerForgetPass: {
		justifyContent: "space-between",
		alignItems: "center",
		gap: 12,
	},
	registerLink: {
		fontSize: 14,
		color: "#2563eb",
		textAlign: "center",
		fontWeight: "500",
	},
	forgetPasswordLink: {
		fontSize: 14,
		color: "#EF4444",
		textAlign: "center",
		fontWeight: "500",
	},
	// Modal Styles
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
		maxHeight: "80%",
	},
	modalHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 8,
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#1F2937",
	},
	closeButton: {
		padding: 4,
	},
	modalSubtitle: {
		fontSize: 14,
		color: "#6B7280",
		marginBottom: 20,
		textAlign: "center",
	},
	sapCodeText: {
		fontWeight: "600",
		color: "#2563eb",
	},
	modalInputGroup: {
		marginBottom: 16,
	},
	modalLabel: {
		fontSize: 14,
		fontWeight: "500",
		color: "#374151",
		marginBottom: 8,
	},
	modalInput: {
		borderWidth: 1,
		borderColor: "#D1D5DB",
		borderRadius: 12,
		paddingHorizontal: 16,
		paddingVertical: 12,
		fontSize: 16,
		backgroundColor: "#F9FAFB",
	},
	modalPasswordInput: {
		borderWidth: 1,
		borderColor: "#D1D5DB",
		borderRadius: 12,
		paddingHorizontal: 16,
		paddingVertical: 12,
		paddingRight: 50,
		fontSize: 16,
		backgroundColor: "#F9FAFB",
	},
	modalButtons: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 20,
		gap: 12,
	},
	cancelButton: {
		flex: 1,
		backgroundColor: "#F3F4F6",
		paddingVertical: 12,
		borderRadius: 12,
		alignItems: "center",
	},
	cancelButtonText: {
		color: "#6B7280",
		fontSize: 16,
		fontWeight: "500",
	},
	resetButton: {
		flex: 1,
		backgroundColor: "#EF4444",
		paddingVertical: 12,
		borderRadius: 12,
		alignItems: "center",
	},
	resetButtonText: {
		color: "#FFFFFF",
		fontSize: 16,
		fontWeight: "600",
	},
	// Success Modal Styles
	successContainer: {
		alignItems: "center",
		paddingVertical: 20,
	},
	successTitle: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#10B981",
		marginTop: 16,
		marginBottom: 8,
		textAlign: "center",
	},
	successMessage: {
		fontSize: 14,
		color: "#6B7280",
		textAlign: "center",
		marginBottom: 24,
		lineHeight: 20,
	},
	loginButton: {
		backgroundColor: "#2563eb",
		paddingVertical: 12,
		paddingHorizontal: 32,
		borderRadius: 12,
		alignItems: "center",
	},
	loginButtonText: {
		color: "#FFFFFF",
		fontSize: 16,
		fontWeight: "600",
	},
});

export default LoginScreen;
