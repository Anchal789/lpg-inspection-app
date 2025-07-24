"use client"

import { useState, useEffect } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../context/AuthContext"
import ApiService from "../../api/api-service"

const LoginScreen = ({ navigation, route }) => {
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const { login } = useAuth()

  const sapCode = route.params?.sapCode || ""

  useEffect(() => {
    if (!sapCode) {
      navigation.navigate("SAPCode")
    }
  }, [sapCode])

  const validateForm = () => {
    const newErrors = {}

    if (!phone.trim()) {
      newErrors.phone = "Phone number is required"
    } else if (phone.length !== 10) {
      newErrors.phone = "Phone number must be exactly 10 digits"
    } else if (!/^\d+$/.test(phone)) {
      newErrors.phone = "Phone number must contain only numbers"
    }

    if (!password.trim()) {
      newErrors.password = "Password is required"
    } else if (password.length < 4) {
      newErrors.password = "Password must be at least 4 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async () => {
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const response = await ApiService.login(phone, password, sapCode)

      if (response.success) {
        await login(response.data)

        // Navigate based on user role
        if (response.data.role === "super_admin") {
          navigation.reset({
            index: 0,
            routes: [{ name: "SuperAdminDashboard" }],
          })
        } else if (response.data.role === "admin") {
          navigation.reset({
            index: 0,
            routes: [{ name: "AdminDashboard" }],
          })
        } else if (response.data.role === "delivery_man") {
          navigation.reset({
            index: 0,
            routes: [{ name: "DeliveryDashboard" }],
          })
        }
      } else {
        Alert.alert("Login Failed", response.error || "Invalid credentials. Please try again.", [{ text: "OK" }])
      }
    } catch (error) {
      console.error("Login error:", error)
      Alert.alert("Error", "Login failed. Please check your internet connection and try again.", [{ text: "OK" }])
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    navigation.goBack()
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>SAP Code: {sapCode}</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={[styles.input, errors.phone && styles.inputError]}
            value={phone}
            onChangeText={(text) => {
              setPhone(text.replace(/[^0-9]/g, ""))
              if (errors.phone) {
                setErrors((prev) => ({ ...prev, phone: null }))
              }
            }}
            placeholder="Enter phone number"
            keyboardType="numeric"
            maxLength={10}
            editable={!loading}
          />
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.passwordInput, errors.password && styles.inputError]}
              value={password}
              onChangeText={(text) => {
                setPassword(text)
                if (errors.password) {
                  setErrors((prev) => ({ ...prev, password: null }))
                }
              }}
              placeholder="Enter password"
              secureTextEntry={!showPassword}
              editable={!loading}
            />
            <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#666" />
            </TouchableOpacity>
          </View>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  backButton: {
    marginTop: 40,
    marginBottom: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  inputError: {
    borderColor: "#ff4444",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    borderWidth: 0,
  },
  eyeButton: {
    padding: 15,
  },
  errorText: {
    color: "#ff4444",
    fontSize: 14,
    marginTop: 5,
  },
  button: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
})

export default LoginScreen
