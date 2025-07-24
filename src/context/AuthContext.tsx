"use client"

import { createContext, useContext, useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import ApiService from "../api/api-service"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthState()
  }, [])

  const checkAuthState = async () => {
    try {
      const userData = await AsyncStorage.getItem("user")
      const token = await AsyncStorage.getItem("token")

      if (userData && token) {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        ApiService.setToken(token)
      }
    } catch (error) {
      console.error("Auth check error:", error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (userData) => {
    try {
      await AsyncStorage.setItem("user", JSON.stringify(userData))
      await AsyncStorage.setItem("token", userData.token)
      setUser(userData)
      ApiService.setToken(userData.token)
      return { success: true }
    } catch (error) {
      console.error("Login storage error:", error)
      return { success: false, error: "Failed to save login data" }
    }
  }

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("user")
      await AsyncStorage.removeItem("token")
      setUser(null)
      ApiService.clearToken()
      return { success: true }
    } catch (error) {
      console.error("Logout error:", error)
      return { success: false, error: "Failed to logout" }
    }
  }

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
