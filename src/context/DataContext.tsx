"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ApiService from "../api/api-service";
import { useAuth } from "./AuthContext";

interface Product {
	id: string;
	name: string;
	price: number;
	quantity: number;
	minPrice: number;
	soldQuantity?: number;
	assignedQuantity?: number;
}

interface DeliveryMan {
	id: string;
	name: string;
	phone: string;
	assignedProducts: Product[];
	totalInspections: number;
	totalSales: number;
}

interface Inspection {
	id: string;
	consumerName: string;
	consumerNumber: string;
	mobileNumber: string;
	address: string;
	deliveryManId: string;
	deliveryManName: string;
	date: string;
	totalAmount: number;
	products: any[];
	images: string[];
	answers: Record<number, string>;
	location?: { latitude: number; longitude: number };
	surakshaHoseDueDate?: string;
	hotplateExchange?: boolean;
	otherDiscount?: number;
}

interface AppSettings {
	hotplateName: string;
	hotplatePrice: number;
	portablePlatformName: string;
	portablePlatformPrice: number;
	hotplateExchangeRate: number;
}

interface DataContextType {
	products: Product[];
	deliveryMen: DeliveryMan[];
	inspections: Inspection[];
	appSettings: AppSettings;
	loading: boolean;
	addProduct: (product: Product) => Promise<any>;
	updateProduct: (productId: string, productData: any) => Promise<any>;
	deleteProduct: (productId: string) => Promise<any>;
	assignProductToDeliveryMan: (
		deliveryManId: string,
		product: Product
	) => Promise<boolean>;
	updateAssignedProduct: (
		deliveryManId: string,
		assignedProductId: string,
		updateData: any
	) => Promise<boolean>;
	addInspection: (inspection: Inspection) => Promise<any>;
	updateProductStock: (productId: string, soldQuantity: number) => void;
	refreshData: () => Promise<void>;
	toggleDeliveryManStatus: (deliveryManId: string) => Promise<boolean>;
	updateAppSettings: (settingsData: Partial<AppSettings>) => Promise<any>;
	resetAppSettings: () => Promise<any>;
}

const defaultAppSettings: AppSettings = {
	hotplateName: "Hi-star Hotplate",
	hotplatePrice: 2500,
	portablePlatformName: "Portable Kitchen Platform",
	portablePlatformPrice: 1500,
	hotplateExchangeRate: 450,
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const { token, user } = useAuth();
	const [products, setProducts] = useState<Product[]>([]);
	const [deliveryMen, setDeliveryMen] = useState<DeliveryMan[]>([]);
	const [inspections, setInspections] = useState<Inspection[]>([]);
	const [appSettings, setAppSettings] = useState<AppSettings>(defaultAppSettings);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (token && user) {
			refreshData();
		} else {
			setLoading(false);
		}
	}, [token, user]);

	const refreshData = async () => {
		if (!token || !user) {
			console.log("No token or user available for refresh");
			setLoading(false);
			return;
		}

		try {
			setLoading(true);

			// Set token for API service
			ApiService.setToken(token);

			// Prepare API calls with proper parameters
			const apiCalls = [];

			// Get products - use distributorId from user context
			if (user.distributorId) {
				apiCalls.push(
					ApiService.getProducts(user.distributorId).catch((error) => {
						console.error("Products API error:", error);
						return { success: false, error: error.message, data: [] };
					})
				);
			} else {
				apiCalls.push(Promise.resolve({ success: false, data: [] }));
			}

			// Get delivery men - use distributorId from user context
			if (user.distributorId) {
				apiCalls.push(
					ApiService.getDeliveryMen(user.distributorId).catch((error) => {
						console.error("Delivery men API error:", error);
						return { success: false, error: error.message, data: [] };
					})
				);
			} else {
				apiCalls.push(Promise.resolve({ success: false, data: [] }));
			}

			// Get inspections - no specific parameters needed for basic fetch
			apiCalls.push(
				ApiService.getInspections().catch((error) => {
					console.error("Inspections API error:", error);
					return { success: false, error: error.message, data: [] };
				})
			);

			// Get app settings - use distributorId from user context
			if (user.distributorId) {
				apiCalls.push(
					ApiService.getAppSettings(user.distributorId).catch((error) => {
						console.error("App settings API error:", error);
						return { success: false, error: error.message, data: { appSettings: defaultAppSettings } };
					})
				);
			} else {
				apiCalls.push(Promise.resolve({ success: false, data: { appSettings: defaultAppSettings } }));
			}

			// Execute all API calls in parallel
			const [productsResponse, deliveryMenResponse, inspectionsResponse, appSettingsResponse] =
				await Promise.all(apiCalls);

			// Handle products response
			if (productsResponse?.success && productsResponse.data) {
				// Handle both array and object responses
				const productsData = Array.isArray(productsResponse.data)
					? productsResponse.data
					: productsResponse.data.products || [];
				setProducts(productsData);
			} else {
				console.log("❌ Products fetch failed:", productsResponse?.error);
				setProducts([]);
			}

			// Handle delivery men response
			if (deliveryMenResponse?.success && deliveryMenResponse.data) {
				const deliveryMenData = Array.isArray(deliveryMenResponse.data)
					? deliveryMenResponse.data
					: deliveryMenResponse.data.deliveryMen || [];
				setDeliveryMen(deliveryMenData);
			} else {
				console.log(
					"❌ Delivery men fetch failed:",
					deliveryMenResponse?.error
				);
				setDeliveryMen([]);
			}

			// Handle inspections response
			if (inspectionsResponse?.success && inspectionsResponse.data) {
				const inspectionsData = Array.isArray(inspectionsResponse.data)
					? inspectionsResponse.data
					: inspectionsResponse.data.inspections || [];
				setInspections(inspectionsData);
			} else {
				console.log("❌ Inspections fetch failed:", inspectionsResponse?.error);
				setInspections([]);
			}

			// Handle app settings response
			if (appSettingsResponse?.success && appSettingsResponse.data) {
				const settingsData = appSettingsResponse.data.appSettings || appSettingsResponse.data;
				setAppSettings(settingsData);
			} else {
				console.log("❌ App settings fetch failed:", appSettingsResponse?.error);
				setAppSettings(defaultAppSettings);
			}

			// Store successful data in AsyncStorage as backup
			try {
				await AsyncStorage.setItem("products", JSON.stringify(products));
				await AsyncStorage.setItem("deliveryMen", JSON.stringify(deliveryMen));
				await AsyncStorage.setItem("inspections", JSON.stringify(inspections));
				await AsyncStorage.setItem("appSettings", JSON.stringify(appSettings));
			} catch (storageError) {
				console.error("Storage error:", storageError);
			}
		} catch (error) {
			console.error("❌ Error refreshing data:", error);
			// Load from AsyncStorage as fallback
			await loadStoredData();
		} finally {
			setLoading(false);
		}
	};

	const loadStoredData = async () => {
		try {
			console.log("📱 Loading stored data...");

			const storedProducts = await AsyncStorage.getItem("products");
			const storedDeliveryMen = await AsyncStorage.getItem("deliveryMen");
			const storedInspections = await AsyncStorage.getItem("inspections");
			const storedAppSettings = await AsyncStorage.getItem("appSettings");

			if (storedProducts) {
				setProducts(JSON.parse(storedProducts));
				console.log("📦 Loaded stored products");
			}

			if (storedDeliveryMen) {
				setDeliveryMen(JSON.parse(storedDeliveryMen));
				console.log("👨‍💼 Loaded stored delivery men");
			}

			if (storedInspections) {
				setInspections(JSON.parse(storedInspections));
				console.log("🔍 Loaded stored inspections");
			}

			if (storedAppSettings) {
				setAppSettings(JSON.parse(storedAppSettings));
				console.log("⚙️ Loaded stored app settings");
			}
		} catch (error) {
			console.error("Error loading stored data:", error);
		}
	};

	const updateAppSettings = async (settingsData: Partial<AppSettings>): Promise<any> => {
		try {
			if (!token || !user?.distributorId) {
				return { success: false, error: "No authentication token or distributor ID" };
			}

			ApiService.setToken(token);
			const response = await ApiService.updateAppSettings(user.distributorId, settingsData);

			if (response && response.success !== false) {
				// Update local app settings state
				setAppSettings(prev => ({ ...prev, ...settingsData }));
				console.log("✅ App settings updated successfully");
				return response;
			}
			return response || { success: false, error: "Unknown error" };
		} catch (error) {
			console.error("Error updating app settings:", error);
			return {
				success: false,
				error: error.message || "Failed to update app settings",
			};
		}
	};

	const resetAppSettings = async (): Promise<any> => {
		try {
			if (!token || !user?.distributorId) {
				return { success: false, error: "No authentication token or distributor ID" };
			}

			ApiService.setToken(token);
			const response = await ApiService.resetAppSettings(user.distributorId);

			if (response && response.success !== false) {
				// Reset local app settings to default
				setAppSettings(defaultAppSettings);
				console.log("✅ App settings reset successfully");
				return response;
			}
			return response || { success: false, error: "Unknown error" };
		} catch (error) {
			console.error("Error resetting app settings:", error);
			return {
				success: false,
				error: error.message || "Failed to reset app settings",
			};
		}
	};

	const addProduct = async (product: Product): Promise<any> => {
		try {
			if (!token) {
				return { success: false, error: "No authentication token" };
			}

			ApiService.setToken(token);

			const response = await ApiService.addProduct(product);

			if (response && response.success !== false) {
				// Refresh data to get updated product list
				await refreshData();
				return response;
			}
			return response || { success: false, error: "Unknown error" };
		} catch (error) {
			console.error("Error adding product:", error);
			return {
				success: false,
				error: error.message || "Failed to add product",
			};
		}
	};

	// Update product method
	const updateProduct = async (
		productId: string,
		productData: any
	): Promise<any> => {
		try {
			console.log("✏️ Updating product:", productId, productData);

			ApiService.setToken(token);
			const response = await ApiService.apiCall(
				`/products/${productId}`,
				"PUT",
				productData
			);

			if (response && response.success !== false) {
				// Refresh the products list to get updated data
				await refreshData();
				return response;
			} else {
				console.error("Update product failed:", response);
				return {
					success: false,
					error:
						response?.message || response?.error || "Failed to update product",
				};
			}
		} catch (error) {
			console.error("Update product error:", error);
			return {
				success: false,
				error: error.message || "Failed to update product",
			};
		}
	};

	// Delete product method
	const deleteProduct = async (productId: string): Promise<any> => {
		try {
			console.log("🗑️ Deleting product:", productId);

			ApiService.setToken(token);
			const response = await ApiService.apiCall(
				`/products/${productId}`,
				"DELETE"
			);

			if (response && response.success !== false) {
				// Refresh the products list after successful deletion
				await refreshData();
				return response;
			} else {
				console.error("Delete product failed:", response);
				return {
					success: false,
					error:
						response?.message || response?.error || "Failed to delete product",
				};
			}
		} catch (error) {
			console.error("Delete product error:", error);
			return {
				success: false,
				error: error.message || "Failed to delete product",
			};
		}
	};

	const assignProductToDeliveryMan = async (
		deliveryManId: string,
		product: Product
	): Promise<boolean> => {
		try {
			if (!token) return false;

			ApiService.setToken(token);
			const assignmentData = {
				productId: product.id || product._id,
				productName: product.name,
				quantity: product.quantity,
				price: product.price,
				minPrice: product.minPrice,
			};

			const response = await ApiService.assignProduct(
				deliveryManId,
				assignmentData
			);

			if (response && response.success !== false) {
				await refreshData();
				return true;
			}
			return false;
		} catch (error) {
			console.error("Error assigning product:", error);
			return false;
		}
	};

	const updateAssignedProduct = async (
		deliveryManId: string,
		assignedProductId: string,
		updateData: any
	): Promise<boolean> => {
		try {
			if (!token) return false;

			ApiService.setToken(token);

			const response = await ApiService.updateAssignedProduct(
				deliveryManId,
				assignedProductId,
				updateData
			);

			if (response && response.success !== false) {
				await refreshData();
				return true;
			}
			return false;
		} catch (error) {
			console.error("Error updating assigned product:", error);
			return false;
		}
	};

	const toggleDeliveryManStatus = async (
		deliveryManId: string
	): Promise<boolean> => {
		try {
			if (!token) return false;

			ApiService.setToken(token);
			const response = await ApiService.toggleDeliveryManStatusAPI(
				deliveryManId
			);

			if (response && response.success !== false) {
				await refreshData();
				return true;
			}
			return false;
		} catch (error) {
			console.error("Error toggling delivery man status:", error);
			return false;
		}
	};

	const addInspection = async (inspection: Inspection): Promise<any> => {
		try {
			console.log("📋 Sending inspection to API...");

			ApiService.setToken(token);
			const response = await ApiService.createInspection(inspection);
			console.log("API Response:", response);

			if (response && response.success !== false) {
				await refreshData();
				return { success: true };
			} else {
				// Handle API returning success: false
				return {
					success: false,
					error: response?.message || "API returned unsuccessful response",
				};
			}
		} catch (error) {
			console.error("Error adding inspection:", error);

			// Differentiate between different types of errors
			if (error.response) {
				// Server responded with error status
				return {
					success: false,
					error:
						error.response.data?.message ||
						`Server error: ${error.response.status}`,
				};
			} else if (error.request) {
				// Network error
				return {
					success: false,
					error: "Network error - please check your connection",
				};
			} else {
				// Other error
				return {
					success: false,
					error: error.message || "Unknown error occurred",
				};
			}
		}
	};

	const updateProductStock = (productId: string, soldQuantity: number) => {
		setProducts((prevProducts) =>
			prevProducts.map((product) =>
				product.id === productId
					? {
							...product,
							soldQuantity: (product.soldQuantity || 0) + soldQuantity,
					  }
					: product
			)
		);
	};

	const value: DataContextType = {
		products,
		deliveryMen,
		inspections,
		appSettings,
		loading,
		addProduct,
		updateProduct,
		deleteProduct,
		assignProductToDeliveryMan,
		updateAssignedProduct,
		addInspection,
		updateProductStock,
		refreshData,
		toggleDeliveryManStatus,
		updateAppSettings,
		resetAppSettings,
	};

	return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
	const context = useContext(DataContext);
	if (context === undefined) {
		throw new Error("useData must be used within a DataProvider");
	}
	return context;
};