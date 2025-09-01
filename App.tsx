"use client";

import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { DataProvider } from "./src/context/DataContext";

// Import screens
import SAPCodeScreen from "./src/screens/auth/SAPCodeScreen";
import DistributorSignupScreen from "./src/screens/auth/DistributorSignupScreen";
import LoginScreen from "./src/screens/auth/LoginScreen";
import RegisterScreen from "./src/screens/auth/RegisterScreen";

// Super Admin screens
import SuperAdminDashboard from "./src/screens/superAdmin/SuperAdminDashboard";

// Admin screens
import AdminDashboard from "./src/screens/admin/AdminDashboard";
import AdminHistory from "./src/screens/admin/AdminHistory";
import DeliveryManDetails from "./src/screens/admin/DeliveryManDetails";
import InspectionDetails from "./src/screens/admin/InspectionDetails";
import AssignStock from "./src/screens/admin/AssignStock";
import AssignProductScreen from "./src/screens/admin/AssignProductScreen";
import AddProduct from "./src/screens/admin/AddProduct";
import SearchInspection from "./src/screens/admin/SearchInspection";
import DeliveryManManagement from "./src/screens/admin/ManageDeliveryMenScreen";

// Delivery man screens
import DeliveryDashboard from "./src/screens/delivery/DeliveryDashboard";
import NewInspection from "./src/screens/delivery/NewInspection";
import DeliveryHistory from "./src/screens/delivery/DeliveryHistory";
import { View } from "react-native";
import LoadingIndicator from "./src/components/Loader";
import AppSettingsScreen from "./src/screens/admin/AppSettings";

const Stack = createStackNavigator();

function AppNavigator() {
	const { user, isAuthenticated, loading } = useAuth();

	// Show loading screen while checking authentication
	if (loading) {
		return (
			<View>
				<LoadingIndicator />
			</View>
		); // or a loading component
	}

	return (
		<NavigationContainer>
			<StatusBar style='light' backgroundColor='#2563eb' />
			<Stack.Navigator
				screenOptions={{
					headerStyle: {
						backgroundColor: "#2563eb",
					},
					headerTintColor: "#fff",
					headerTitleStyle: {
						fontWeight: "bold",
					},
				}}
			>
				{!isAuthenticated ? (
					// Auth Screens
					<>
						<Stack.Screen
							name='SAPCode'
							component={SAPCodeScreen}
							options={{ headerShown: false }}
						/>
						<Stack.Screen
							name='DistributorSignup'
							component={DistributorSignupScreen}
							options={{ headerShown: false }}
						/>
						<Stack.Screen
							name='Login'
							component={LoginScreen}
							options={{ headerShown: false }}
						/>
					</>
				) : (
					// Authenticated Screens
					<>
						{user?.role === "super_admin" && (
							<>
								<Stack.Screen
									name='SuperAdminDashboard'
									component={SuperAdminDashboard}
									options={{
										title: "Super Admin",
										headerLeft: null,
									}}
								/>
							</>
						)}

						{user?.role === "admin" && (
							<>
								<Stack.Screen
									name='AdminDashboard'
									component={AdminDashboard}
									options={{ title: "Admin Dashboard", headerLeft: null }}
								/>
								<Stack.Screen
									name='Register'
									component={RegisterScreen}
									options={{ title: "Register New User" }}
								/>
								<Stack.Screen
									name='AdminHistory'
									component={AdminHistory}
									options={{ title: "Delivery History" }}
								/>
								<Stack.Screen
									name='DeliveryManDetails'
									component={DeliveryManDetails}
									options={{ title: "Delivery Man Details" }}
								/>
								<Stack.Screen
									name='InspectionDetails'
									component={InspectionDetails}
									options={{ title: "Inspection Details" }}
								/>
								<Stack.Screen
									name='AssignStock'
									component={AssignStock}
									options={{ title: "Assign Stock" }}
								/>
								<Stack.Screen
									name='AssignProduct'
									component={AssignProductScreen}
									options={{ title: "Assign Products" }}
								/>
								<Stack.Screen
									name='AddProduct'
									component={AddProduct}
									options={{ title: "Add Product" }}
								/>
								<Stack.Screen
									name='SearchInspection'
									component={SearchInspection}
									options={{ title: "Search Inspections" }}
								/>
								<Stack.Screen
									name='ManageDeliveryMen'
									component={DeliveryManManagement}
									options={{ title: "Manage Delivery Men" }}
								/>
								<Stack.Screen
									name='AppSettings'
									component={AppSettingsScreen}
									options={{ title: "General Settings" }}
								/>
							</>
						)}

						{user?.role === "delivery" && (
							<>
								<Stack.Screen
									name='DeliveryDashboard'
									component={DeliveryDashboard}
									options={{ title: "Dashboard", headerLeft: null }}
								/>
								<Stack.Screen
									name='NewInspection'
									component={NewInspection}
									options={{ title: "New Inspection" }}
								/>
								<Stack.Screen
									name='DeliveryHistory'
									component={DeliveryHistory}
									options={{ title: "My History" }}
								/>
								<Stack.Screen
									name='InspectionDetails'
									component={InspectionDetails}
									options={{ title: "Inspection Details" }}
								/>
							</>
						)}
					</>
				)}
			</Stack.Navigator>
		</NavigationContainer>
	);
}

export default function App() {
	return (
		<AuthProvider>
			<DataProvider>
				<AppNavigator />
			</DataProvider>
		</AuthProvider>
	);
}
