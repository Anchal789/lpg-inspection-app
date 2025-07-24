"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native"
import { useAuth } from "../../context/AuthContext"
import ApiService from "../../api/api-service"

const SAPCodeScreen = ({ navigation }) => {
  const [sapCode, setSapCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const { login } = useAuth()

  const validateSapCode = (code) => {
    const newErrors = {}

    if (!code.trim()) {
      newErrors.sapCode = "SAP code is required"
    } else if (code.length < 5) {
      newErrors.sapCode = "SAP code must be at least 5 characters"
    } else if (code.length > 10) {
      newErrors.sapCode = "SAP code must not exceed 10 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleContinue = async () => {
    if (!validateSapCode(sapCode)) {
      return
    }

    setLoading(true)

    try {
      // Test connection first
      const connectionTest = await ApiService.testConnection()
      if (!connectionTest.success) {
        Alert.alert(
          "Connection Error",
          "Unable to connect to server. Please check your internet connection and try again.",
          [{ text: "OK" }],
        )
        setLoading(false)
        return
      }

      // Validate SAP code with backend
      const response = await ApiService.validateSapCode(sapCode.trim())

      if (response.success) {
        // SAP code is valid, navigate to login
        navigation.navigate("Login", { sapCode: sapCode.trim() })
      } else {
        Alert.alert("Invalid SAP Code", response.error || "SAP code not found in database. Please contact admin.", [
          { text: "OK" },
        ])
      }
    } catch (error) {
      console.error("SAP validation error:", error)
      Alert.alert("Error", "Failed to validate SAP code. Please try again.", [{ text: "OK" }])
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = () => {
    navigation.navigate("DistributorSignup")
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>LPG Inspection</Text>
        <Text style={styles.subtitle}>Enter your SAP Code to continue</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>SAP Code</Text>
          <TextInput
            style={[styles.input, errors.sapCode && styles.inputError]}
            value={sapCode}
            onChangeText={(text) => {
              setSapCode(text)
              if (errors.sapCode) {
                validateSapCode(text)
              }
            }}
            placeholder="Enter SAP Code"
            autoCapitalize="characters"
            maxLength={10}
            editable={!loading}
          />
          {errors.sapCode && <Text style={styles.errorText}>{errors.sapCode}</Text>}
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Continue</Text>}
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={handleRegister} disabled={loading}>
            <Text style={styles.registerLink}>Register as Distributor</Text>
          </TouchableOpacity>
        </View>
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
  header: {
    alignItems: "center",
    marginTop: 60,
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
    textAlign: "center",
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
  registerContainer: {
    alignItems: "center",
    marginTop: 30,
  },
  registerText: {
    color: "#666",
    fontSize: 14,
  },
  registerLink: {
    color: "#007bff",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 5,
  },
})

export default SAPCodeScreen
