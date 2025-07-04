"use client"

import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { useAuth } from "../../context/AuthContext"

const LoginScreen = () => {
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const navigation = useNavigation()
  const route = useRoute()
  const { login } = useAuth()

  const sapCode = (route.params as any)?.sapCode || ""

  const handleLogin = () => {
    if (!phone || !password) {
      Alert.alert("Error", "Please fill all fields")
      return
    }

    // Mock authentication - in real app, validate against backend
    if (phone === "9876543210" && password === "admin123") {
      login({
        id: "1",
        name: "Admin User",
        phone: phone,
        role: "admin",
        sapCode: sapCode,
      })
      navigation.navigate("AdminDashboard" as never)
    } else if (phone === "9876543211" && password === "delivery123") {
      login({
        id: "2",
        name: "Ravi Singh",
        phone: phone,
        role: "delivery",
        sapCode: sapCode,
      })
      navigation.navigate("DeliveryDashboard" as never)
    } else {
      Alert.alert("Error", "Invalid credentials")
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image source={{ uri: "/placeholder.svg?height=100&width=100" }} style={styles.logo} />
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>

          {/* Register link */}
          <TouchableOpacity style={styles.registerLink} onPress={() => navigation.navigate("Register" as never)}>
            <Text style={styles.registerText}>Register a new user</Text>
          </TouchableOpacity>
        </View>

        {/* Demo credentials */}
        <View style={styles.demoContainer}>
          <Text style={styles.demoTitle}>Demo Credentials:</Text>
          <Text style={styles.demoText}>Admin: 9876543210 / admin123</Text>
          <Text style={styles.demoText}>Delivery: 9876543211 / delivery123</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

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
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
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
    marginBottom: 20,
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
  },
  loginButton: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  registerLink: {
    alignItems: "center",
  },
  registerText: {
    fontSize: 14,
    color: "#2563EB",
    fontWeight: "500",
  },
  demoContainer: {
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F59E0B",
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#92400E",
    marginBottom: 8,
  },
  demoText: {
    fontSize: 12,
    color: "#92400E",
    marginBottom: 4,
  },
})

export default LoginScreen
