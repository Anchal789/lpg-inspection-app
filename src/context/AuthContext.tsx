"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import ApiService from "../api/api-service"

interface User {
  id: string
  name: string
  phone: string
  role: string
  sapCode?: string
  distributorId?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  sapCode: string | null
  loading: boolean
  isAuthenticated: boolean // Add this line
  login: (userData: User, authToken: string) => Promise<void>
  logout: () => Promise<void>
  setSapCode: (code: string) => void
  validateSAPCode: (code: string) => Promise<boolean>
  registerUser: (userData: any) => Promise<boolean>
  registerDistributor: (distributorData: any) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [sapCode, setSapCodeState] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Add computed property for isAuthenticated
  const isAuthenticated = !!(user && token)

  useEffect(() => {
    loadStoredAuth()
  }, [])

  const loadStoredAuth = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user")
      const storedToken = await AsyncStorage.getItem("token")
      const storedSapCode = await AsyncStorage.getItem("sapCode")

      if (storedUser && storedToken) {
        const userData = JSON.parse(storedUser)
        setUser(userData)
        setToken(storedToken)
        setSapCodeState(storedSapCode)
        ApiService.setToken(storedToken)
      }
    } catch (error) {
      console.error("❌ Error loading stored auth:", error)
    } finally {
      setLoading(false)
    }
  }

  const validateSAPCode = async (code: string): Promise<boolean> => {
    try {
      const response = await ApiService.validateSapCode(code)
      if (response.success) {
        setSapCodeState(code)
        await AsyncStorage.setItem("sapCode", code)
        return true
      }
      return false
    } catch (error) {
      console.error("SAP validation error:", error)
      return false
    }
  }

  const login = async (userData: User, authToken: string) => {
    try {
      setUser(userData)
      setToken(authToken)

      // Store in AsyncStorage
      await AsyncStorage.setItem("user", JSON.stringify(userData))
      await AsyncStorage.setItem("token", authToken)
    } catch (error) {
      console.error("❌ AuthContext: Login storage error:", error)
      throw error
    }
  }

  const registerUser = async (userData: any): Promise<boolean> => {
    try {
      const response = await ApiService.registerUser(userData, token)
      return response.success
    } catch (error) {
      console.error("Register user error:", error)
      return false
    }
  }

  const registerDistributor = async (distributorData: any): Promise<boolean> => {
    try {
      const response = await ApiService.registerDistributor(distributorData)
      return response.success
    } catch (error) {
      console.error("Register distributor error:", error)
      return false
    }
  }

  const logout = async () => {
    try {
      setUser(null)
      setToken(null)
      setSapCodeState(null)

      // Clear AsyncStorage
      await AsyncStorage.multiRemove(["user", "token", "sapCode"])
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const setSapCode = (code: string) => {
    setSapCodeState(code)
  }

  const value: AuthContextType = {
    user,
    token,
    sapCode,
    loading,
    isAuthenticated, // Add this line
    login,
    logout,
    setSapCode,
    validateSAPCode,
    registerUser,
    registerDistributor,
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export { AuthContext }
