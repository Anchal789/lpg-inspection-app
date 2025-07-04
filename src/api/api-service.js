// API Service - Frontend to Backend communication
// This file shows how your React Native app will communicate with your backend

const API_BASE_URL = "https://lpg-inspection-app-production.up.railway.app/api" // Replace with your actual API URL

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
    this.token = null
  }

  setToken(token) {
    this.token = token
  }

  // Generic API call method
  async apiCall(endpoint, method = "GET", data = null, headers = {}) {
    try {
      const config = {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      }

      // Add authorization header if token exists
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`
      }

      if (data && (method === "POST" || method === "PUT" || method === "PATCH")) {
        config.body = JSON.stringify(data)
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, config)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`)
      }

      return result
    } catch (error) {
      console.error("API call error:", error)
      throw error
    }
  }

  // ==================== AUTHENTICATION ====================

  async login(phone, password, sapCode) {
    const response = await this.apiCall("/auth/login", "POST", {
      phone,
      password,
      sapCode,
    })

    if (response.success && response.data.token) {
      this.setToken(response.data.token)
    }

    return response
  }

  async registerDistributor(distributorData) {
    return await this.apiCall("/auth/register-distributor", "POST", distributorData)
  }

  async validateSapCode(sapCode) {
    return await this.apiCall("/auth/validate-sap", "POST", { sapCode })
  }

  // ==================== SUPER ADMIN ====================

  async getSuperAdminStats() {
    return await this.apiCall("/super-admin/dashboard-stats")
  }

  async getPendingRequests() {
    return await this.apiCall("/super-admin/distributor-requests")
  }

  async approveDistributor(requestId) {
    return await this.apiCall(`/super-admin/approve-distributor/${requestId}`, "POST")
  }

  async rejectDistributor(requestId, reason) {
    return await this.apiCall(`/super-admin/reject-distributor/${requestId}`, "POST", { reason })
  }

  async getAllDistributors() {
    return await this.apiCall("/super-admin/distributors")
  }

  // ==================== INSPECTIONS ====================

  async createInspection(inspectionData) {
    return await this.apiCall("/inspections", "POST", inspectionData)
  }

  async getMyInspections(deliveryManId, page = 1) {
    return await this.apiCall(`/inspections/delivery-man/${deliveryManId}?page=${page}`)
  }

  async searchInspections(filters) {
    const queryParams = new URLSearchParams(filters).toString()
    return await this.apiCall(`/inspections/search?${queryParams}`)
  }

  async getInspectionDetails(inspectionId) {
    return await this.apiCall(`/inspections/${inspectionId}`)
  }

  // ==================== PRODUCTS ====================

  async getProducts(distributorId) {
    return await this.apiCall(`/products/${distributorId}`)
  }

  async createProduct(productData) {
    return await this.apiCall("/products", "POST", productData)
  }

  async assignProduct(deliveryManId, productData) {
    return await this.apiCall(`/delivery-men/${deliveryManId}/assign-product`, "POST", productData)
  }

  // ==================== DELIVERY MEN ====================

  async getDeliveryMen(distributorId) {
    return await this.apiCall(`/delivery-men/${distributorId}`)
  }

  async createDeliveryMan(deliveryManData) {
    return await this.apiCall("/delivery-men", "POST", deliveryManData)
  }

  // ==================== DASHBOARD ====================

  async getDashboardStats(distributorId) {
    return await this.apiCall(`/dashboard/stats/${distributorId}`)
  }

  // ==================== IMAGE UPLOAD ====================

  async uploadImage(imageUri, inspectionId) {
    try {
      const formData = new FormData()
      formData.append("image", {
        uri: imageUri,
        type: "image/jpeg",
        name: `inspection_${inspectionId}_${Date.now()}.jpg`,
      })
      formData.append("inspectionId", inspectionId)

      const response = await fetch(`${this.baseURL}/upload/image`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Image upload error:", error)
      throw error
    }
  }

  async uploadMultipleImages(imageUris, inspectionId) {
    try {
      const formData = new FormData()

      imageUris.forEach((uri, index) => {
        formData.append("images", {
          uri: uri,
          type: "image/jpeg",
          name: `inspection_${inspectionId}_${index}_${Date.now()}.jpg`,
        })
      })

      formData.append("inspectionId", inspectionId)

      const response = await fetch(`${this.baseURL}/upload/images`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Multiple images upload error:", error)
      throw error
    }
  }
}

export default new ApiService()
