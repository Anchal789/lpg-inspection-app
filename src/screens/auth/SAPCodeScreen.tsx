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
import { useNavigation } from "@react-navigation/native"

const SAPCodeScreen = () => {
  const [sapCode, setSapCode] = useState("")
  const navigation = useNavigation()

  const handleSubmit = () => {
    if (!sapCode.trim()) {
      Alert.alert("Error", "Please enter SAP code")
      return
    }

    // Mock validation - in real app, validate against backend
    if (sapCode === "DIST001") {
      navigation.navigate("Login" as never, { sapCode } as never)
    } else {
      Alert.alert("Error", "Invalid SAP code")
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image source={{ uri: "/placeholder.svg?height=120&width=120" }} style={styles.logo} />
          <Text style={styles.title}>LPG Safety Inspector</Text>
          <Text style={styles.subtitle}>Professional Gas Safety Solutions</Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <Text style={styles.label}>Enter SAP Code</Text>
          <TextInput
            style={styles.input}
            value={sapCode}
            onChangeText={setSapCode}
            placeholder="Enter your distributor SAP code"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="characters"
          />

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Continue</Text>
          </TouchableOpacity>

          {/* Sign up link */}
          <TouchableOpacity style={styles.signupLink} onPress={() => navigation.navigate("DistributorSignup" as never)}>
            <Text style={styles.signupText}>
              New Distributor? <Text style={styles.signupTextBold}>Sign Up here</Text>
            </Text>
          </TouchableOpacity>
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
    marginBottom: 48,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
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
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
    marginBottom: 24,
  },
  submitButton: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  signupLink: {
    alignItems: "center",
  },
  signupText: {
    fontSize: 14,
    color: "#6B7280",
  },
  signupTextBold: {
    color: "#2563EB",
    fontWeight: "600",
  },
})

export default SAPCodeScreen
