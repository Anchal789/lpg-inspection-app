// PRODUCTION API Service - Replace with your actual Railway/Render URL
// const API_BASE_URL = "http://10.0.2.2:3000/api"; // CHANGE THIS TO YOUR DEPLOYED URL
// const API_BASE_URL = "http://localhost:3000/api" // CHANGE THIS TO YOUR DEPLOYED URL
const API_BASE_URL = "https://lpg-inspection-backend-production.up.railway.app/api" // CHANGE THIS TO YOUR DEPLOYED URL

class ApiService {
	constructor() {
		this.baseURL = API_BASE_URL;
		this.token = null;
	}

	setToken(token) {
		this.token = token;
	}

	clearToken() {
		this.token = null;
	}

	// Generic API call method with better error handling
	async apiCall(endpoint, method = "GET", data = null, headers = {}) {
		try {
			const config = {
				method,
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
					...headers,
				},
			};

			// Add authorization header if token exists
			if (this.token) {
				config.headers.Authorization = `Bearer ${this.token}`;
			}

			if (
				data &&
				(method === "POST" || method === "PUT" || method === "PATCH")
			) {
				config.body = JSON.stringify(data);
			}

			const response = await fetch(`${this.baseURL}${endpoint}`, config);

			let result;
			try {
				result = await response.json();
			} catch (parseError) {
				console.error("JSON parse error:", parseError);
				throw new Error(
					`Server response error: ${response.status} ${response.statusText}`
				);
			}

			if (!response.ok) {
				throw new Error(
					result.message ||
						result.error ||
						`HTTP error! status: ${response.status}`
				);
			}

			return result;
		} catch (error) {
			console.error("API call error:", error);
			// Network error handling
			if (
				error.message.includes("Network request failed") ||
				error.message.includes("fetch")
			) {
				throw new Error(
					"Network connection failed. Please check your internet connection."
				);
			}
			throw error;
		}
	}

	// Test connection
	async testConnection() {
		try {
			const response = await fetch(`${this.baseURL}/health`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const result = await response.json();
			return result;
		} catch (error) {
			console.error("Connection test failed:", error);
			return { success: false, error: error.message };
		}
	}

	// ==================== AUTHENTICATION ====================
	async validateSapCode(sapCode) {
		try {
			const response = await this.apiCall("/auth/validate-sap", "POST", {
				sapCode,
			});
			return response;
		} catch (error) {
			return { success: false, error: error.message };
		}
	}

	async login(phone, password, sapCode) {
		try {
			const response = await this.apiCall("/auth/login", "POST", {
				phone,
				password,
				sapCode,
			});
			if (response.success && response.data && response.data.token) {
				this.setToken(response.data.token);
			}
			return response;
		} catch (error) {
			return { success: false, error: error.message };
		}
	}

	async resetPassword(phone, newPassword, sapCode) {
		try {
			const response = await this.apiCall("/auth/reset-password", "POST", {
				phone,
				newPassword,
				sapCode,
			});
			return response;
		} catch (error) {
			return { success: false, error: error.message };
		}
	}

	async registerDistributor(distributorData) {
		try {
			return await this.apiCall(
				"/auth/register-distributor",
				"POST",
				distributorData
			);
		} catch (error) {
			return { success: false, error: error.message };
		}
	}

	async registerUser(userData, token) {
		try {
			const response = await this.apiCall("/auth/register", "POST", userData);
			return response;
		} catch (error) {
			return { success: false, error: error.message };
		}
	}

	async logout() {
		this.clearToken();
		return { success: true, message: "Logged out successfully" };
	}

	///// App Settings
	async getAppSettings(distributorId) {
		try {
			return await this.apiCall(`/app-settings/${distributorId}`);
		} catch (error) {
			return { success: false, error: error.message };
		}
	}

	async updateAppSettings(distributorId, settingsData) {
		try {
			return await this.apiCall(
				`/app-settings/${distributorId}`,
				"PUT",
				settingsData
			);
		} catch (error) {
			return { success: false, error: error.message };
		}
	}

	async resetAppSettings(distributorId) {
		try {
			return await this.apiCall(`/app-settings/${distributorId}/reset`, "POST");
		} catch (error) {
			return { success: false, error: error.message };
		}
	}
	// ==================== SUPER ADMIN ====================
	async getSuperAdminStats() {
		try {
			return await this.apiCall("/super-admin/dashboard-stats");
		} catch (error) {
			return { success: false, error: error.message };
		}
	}

	async getPendingRequests() {
		try {
			return await this.apiCall("/super-admin/distributor-requests");
		} catch (error) {
			return { success: false, error: error.message };
		}
	}

	async approveDistributor(requestId) {
		try {
			return await this.apiCall(
				`/super-admin/approve-distributor/${requestId}`,
				"POST"
			);
		} catch (error) {
			return { success: false, error: error.message };
		}
	}

	async rejectDistributor(requestId, reason) {
		try {
			return await this.apiCall(
				`/super-admin/reject-distributor/${requestId}`,
				"POST",
				{ reason }
			);
		} catch (error) {
			return { success: false, error: error.message };
		}
	}

	async getAllDistributors() {
		try {
			return await this.apiCall("/super-admin/distributors");
		} catch (error) {
			return { success: false, error: error.message };
		}
	}

	// ==================== INSPECTIONS ====================
	async createInspection(inspectionData) {
		try {
			return await this.apiCall("/inspections", "POST", inspectionData);
		} catch (error) {
			return { success: false, error: error.message };
		}
	}

	async getMyInspections(deliveryManId, filters = {}) {
		try {
			const queryParams = new URLSearchParams({
				deliveryManId,
				...filters,
			}).toString();
			return await this.apiCall(`/inspections?${queryParams}`);
		} catch (error) {
			return { success: false, error: error.message };
		}
	}

	async getInspections(filters = {}) {
		try {
			const queryParams = new URLSearchParams(filters).toString();
			return await this.apiCall(
				`/inspections${queryParams ? `?${queryParams}` : ""}`
			);
		} catch (error) {
			return { success: false, error: error.message };
		}
	}

	async searchInspections(filters) {
		try {
			const queryParams = new URLSearchParams(filters).toString();
			return await this.apiCall(`/inspections/search?${queryParams}`);
		} catch (error) {
			return { success: false, error: error.message };
		}
	}

	async getInspectionDetails(inspectionId) {
		try {
			return await this.apiCall(`/inspections/${inspectionId}`);
		} catch (error) {
			return { success: false, error: error.message };
		}
	}

	// ==================== PRODUCTS ====================
	async getProducts(distributorId) {
		try {
			return await this.apiCall(`/products?distributorId=${distributorId}`);
		} catch (error) {
			return { success: false, error: error.message };
		}
	}

	async createProduct(productData) {
		try {
			return await this.apiCall("/products", "POST", productData);
		} catch (error) {
			return { success: false, error: error.message };
		}
	}

	async addProduct(productData) {
		try {
			return await this.apiCall("/products", "POST", productData);
		} catch (error) {
			return { success: false, error: error.message };
		}
	}

	async assignProduct(deliveryManId, productData) {
		try {
			return await this.apiCall(
				`/delivery-men/${deliveryManId}/assign-product`,
				"POST",
				productData
			);
		} catch (error) {
			return { success: false, error: error.message };
		}
	}

	// NEW: Update assigned product
	async updateAssignedProduct(deliveryManId, assignedProductId, updateData) {
		try {
			return await this.apiCall(
				`/delivery-men/${deliveryManId}/assigned-products/${assignedProductId}`,
				"PUT",
				updateData
			);
		} catch (error) {
			return { success: false, error: error.message };
		}
	}

	async updateProductStock(productId, stockData) {
		try {
			return await this.apiCall(
				`/products/${productId}/stock`,
				"PUT",
				stockData
			);
		} catch (error) {
			return { success: false, error: error.message };
		}
	}

	// Update product
	async updateProduct(productId, productData) {
		try {
			return await this.apiCall(`/products/${productId}`, "PUT", productData);
		} catch (error) {
			return { success: false, error: error.message };
		}
	}

	// Delete product
	async deleteProduct(productId) {
		try {
			return await this.apiCall(`/products/${productId}`, "DELETE");
		} catch (error) {
			return { success: false, error: error.message };
		}
	}

	// ==================== DELIVERY MEN ====================
	async getDeliveryMen(distributorId) {
		try {
			return await this.apiCall(`/delivery-men?distributorId=${distributorId}`);
		} catch (error) {
			return { success: false, error: error.message };
		}
	}

	async createDeliveryMan(deliveryManData) {
		try {
			return await this.apiCall("/delivery-men", "POST", deliveryManData);
		} catch (error) {
			return { success: false, error: error.message };
		}
	}

	async toggleDeliveryManStatusAPI(deliveryManId) {
		try {
			return await this.apiCall(
				`/delivery-men/${deliveryManId}/toggle-status`,
				"PUT"
			);
		} catch (error) {
			return { success: false, error: error.message };
		}
	}

	async getDeliveryManDetails(deliveryManId) {
		try {
			return await this.apiCall(`/delivery-men/${deliveryManId}`);
		} catch (error) {
			return { success: false, error: error.message };
		}
	}

	// Add this method to your ApiService class in api-service.js
	async exportInspections(
		inspections,
		deliveryMen,
		fileName = "inspections_export"
	) {
		try {
			const exportData = {
				inspections,
				deliveryMen: deliveryMen || [],
				fileName,
				timestamp: new Date().toISOString(),
			};
			return await this.apiCall("/export/csv", "POST", exportData);
		} catch (error) {
			return { success: false, error: error.message };
		}
	}

	// ==================== DASHBOARD ====================
	async getDashboardStats(distributorId) {
		try {
			return await this.apiCall(
				`/dashboard/stats?distributorId=${distributorId}`
			);
		} catch (error) {
			return { success: false, error: error.message };
		}
	}

	async getWeeklyReport(distributorId, week) {
		try {
			return await this.apiCall(
				`/dashboard/weekly-report?distributorId=${distributorId}&week=${week}`
			);
		} catch (error) {
			return { success: false, error: error.message };
		}
	}

	// ==================== CHARTS ====================
	async getWeeklyInspections() {
		try {
			return await this.apiCall("/charts/weekly-inspections");
		} catch (error) {
			return { success: false, error: error.message };
		}
	}

	async getMonthlyInspections() {
		try {
			return await this.apiCall("/charts/monthly-inspections");
		} catch (error) {
			return { success: false, error: error.message };
		}
	}

	async getSalesData(period = "weekly") {
		try {
			return await this.apiCall(`/charts/sales-data?period=${period}`);
		} catch (error) {
			return { success: false, error: error.message };
		}
	}

	async getDeliveryPerformance() {
		try {
			return await this.apiCall("/charts/delivery-performance");
		} catch (error) {
			return { success: false, error: error.message };
		}
	}

	// ==================== IMAGE UPLOAD ====================
	async uploadImage(imageUri, inspectionId = null) {
		try {
			console.log(API_BASE_URL);
			const formData = new FormData();

			// Extract file extension
			const fileExtension = imageUri.split(".").pop() || "jpg";
			const fileName = inspectionId
				? `inspection_${inspectionId}_${Date.now()}.${fileExtension}`
				: `upload_${Date.now()}.${fileExtension}`;

			// Create proper file object for React Native
			const fileObject = {
				uri: imageUri,
				type: `image/${fileExtension === "jpg" ? "jpeg" : fileExtension}`,
				name: fileName,
			};

			// Important: Use "file" as the field name (matches backend expectation)
			formData.append("file", fileObject);

			if (inspectionId) {
				formData.append("inspectionId", inspectionId);
			}

			// Use fetch directly for file uploads (not apiCall)
			const response = await fetch(`${API_BASE_URL}/upload/single`, {
				method: "POST",
				body: formData,
				headers: {
					Authorization: `Bearer ${this.token}`,
					// Don't set Content-Type - let browser set it with boundary
				},
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`Upload failed: ${response.status} - ${errorText}`);
			}

			return await response.json();
		} catch (error) {
			console.error("Image upload error:", error);
			throw error;
		}
	}
}

export default new ApiService();
