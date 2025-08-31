"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../context/AuthContext"

const DistributorSignupScreen = () => {
  const [formData, setFormData] = useState({
    sapCode: "",
    agencyName: "",
    adminName: "",
    adminPhone: "",
    adminPassword: "",
  })
  const [deliveryMen, setDeliveryMen] = useState([])
  const [newDeliveryMan, setNewDeliveryMan] = useState({
    name: "",
    phone: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showDeliveryPassword, setShowDeliveryPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [deliveryManErrors, setDeliveryManErrors] = useState({})

  const navigation = useNavigation()
  const { registerDistributor } = useAuth()

  const validateForm = () => {
    const newErrors = {}

    // SAP Code validation
    if (!formData.sapCode) {
      newErrors.sapCode = "SAP code is required"
    } else if (formData.sapCode.length < 5 || formData.sapCode.length > 10) {
      newErrors.sapCode = "SAP code must be 5-10 characters"
    }

    // Agency Name validation
    if (!formData.agencyName) {
      newErrors.agencyName = "Agency name is required"
    } else if (formData.agencyName.length < 3 || formData.agencyName.length > 40) {
      newErrors.agencyName = "Agency name must be 3-40 characters"
    }

    // Admin Name validation
    if (!formData.adminName) {
      newErrors.adminName = "Admin name is required"
    } else if (formData.adminName.length < 3 || formData.adminName.length > 40) {
      newErrors.adminName = "Admin name must be 3-40 characters"
    }

    // Phone validation
    if (!formData.adminPhone) {
      newErrors.adminPhone = "Phone number is required"
    } else if (!/^[6-9]\d{9}$/.test(formData.adminPhone)) {
      newErrors.adminPhone = "Please enter a valid 10-digit Indian mobile number"
    }

    // Password validation
    if (!formData.adminPassword) {
      newErrors.adminPassword = "Password is required"
    } else if (formData.adminPassword.length < 4) {
      newErrors.adminPassword = "Password must be at least 4 characters"
    }

    return newErrors
  }

  const validateDeliveryMan = () => {
    const newErrors = {}

    if (newDeliveryMan.name && newDeliveryMan.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters"
    }

    if (newDeliveryMan.phone && !/^[6-9]\d{9}$/.test(newDeliveryMan.phone)) {
      newErrors.phone = "Please enter a valid 10-digit Indian mobile number"
    }

    if (newDeliveryMan.password && newDeliveryMan.password.length < 4) {
      newErrors.password = "Password must be at least 4 characters"
    }

    return newErrors
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === "sapCode" ? value.toUpperCase() : value,
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      const newErrors = { ...errors }
      delete newErrors[field]
      setErrors(newErrors)
    }
  }

  const handleDeliveryManChange = (field, value) => {
    setNewDeliveryMan((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Clear error when user starts typing
    if (deliveryManErrors[field]) {
      const newErrors = { ...deliveryManErrors }
      delete newErrors[field]
      setDeliveryManErrors(newErrors)
    }
  }

  const addDeliveryMan = () => {
    const validationErrors = validateDeliveryMan()
    setDeliveryManErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    if (!newDeliveryMan.name || !newDeliveryMan.phone || !newDeliveryMan.password) {
      Alert.alert("Error", "Please fill all delivery man details")
      return
    }

    // Check for duplicate phone numbers
    if (deliveryMen.some((dm) => dm.phone === newDeliveryMan.phone)) {
      Alert.alert("Error", "This phone number is already added")
      return
    }

    setDeliveryMen([...deliveryMen, newDeliveryMan])
    setNewDeliveryMan({ name: "", phone: "", password: "" })
    setDeliveryManErrors({})
  }

  const removeDeliveryMan = (index) => {
    setDeliveryMen(deliveryMen.filter((_, i) => i !== index))
  }

  const handleRegister = async () => {
    const validationErrors = validateForm()
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setLoading(true)
    try {
      const distributorData = {
        ...formData,
        companyName: formData.agencyName,
        ownerName: formData.adminName,
        phone: formData.adminPhone,
        deliveryMen: deliveryMen,
      }

      const success = await registerDistributor(distributorData)

      if (success) {
        Alert.alert(
          "Registration Successful",
          "Your registration request has been submitted successfully. Please wait for admin approval.",
          [
            {
              text: "OK",
              onPress: () => navigation.navigate("SAPCode"),
            },
          ]
        )
      } else {
        Alert.alert("Registration Failed", "Registration failed. Please try again.")
      }
    } catch (error) {
      console.error("Registration error:", error)
      Alert.alert("Error", "Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    navigation.goBack()
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Register Distributor</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* <Text style={styles.title}>Register New Distributor</Text> */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Agency Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gas Agency Name *</Text>
            <TextInput
              style={[styles.input, errors.agencyName && styles.inputError]}
              value={formData.agencyName}
              onChangeText={(text) => handleInputChange("agencyName", text)}
              placeholder="Enter agency name"
            />
            {errors.agencyName && <Text style={styles.errorText}>{errors.agencyName}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>SAP Code *</Text>
            <TextInput
              style={[styles.input, errors.sapCode && styles.inputError]}
              value={formData.sapCode}
              onChangeText={(text) => handleInputChange("sapCode", text)}
              placeholder="Enter SAP code"
              autoCapitalize="characters"
              maxLength={10}
            />
            {errors.sapCode && <Text style={styles.errorText}>{errors.sapCode}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Admin Name *</Text>
            <TextInput
              style={[styles.input, errors.adminName && styles.inputError]}
              value={formData.adminName}
              onChangeText={(text) => handleInputChange("adminName", text)}
              placeholder="Enter admin name"
            />
            {errors.adminName && <Text style={styles.errorText}>{errors.adminName}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={[styles.input, errors.adminPhone && styles.inputError]}
              value={formData.adminPhone}
              onChangeText={(text) => handleInputChange("adminPhone", text)}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
              maxLength={10}
            />
            {errors.adminPhone && <Text style={styles.errorText}>{errors.adminPhone}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.passwordInput, errors.adminPassword && styles.inputError]}
                value={formData.adminPassword}
                onChangeText={(text) => handleInputChange("adminPassword", text)}
                placeholder="Enter password"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            {errors.adminPassword && <Text style={styles.errorText}>{errors.adminPassword}</Text>}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Register Delivery Men (Optional)</Text>

          <View style={styles.deliveryManForm}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={[styles.input, deliveryManErrors.name && styles.inputError]}
                value={newDeliveryMan.name}
                onChangeText={(text) => handleDeliveryManChange("name", text)}
                placeholder="Enter delivery man name"
              />
              {deliveryManErrors.name && <Text style={styles.errorText}>{deliveryManErrors.name}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={[styles.input, deliveryManErrors.phone && styles.inputError]}
                value={newDeliveryMan.phone}
                onChangeText={(text) => handleDeliveryManChange("phone", text)}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                maxLength={10}
              />
              {deliveryManErrors.phone && <Text style={styles.errorText}>{deliveryManErrors.phone}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.passwordInput, deliveryManErrors.password && styles.inputError]}
                  value={newDeliveryMan.password}
                  onChangeText={(text) => handleDeliveryManChange("password", text)}
                  placeholder="Enter password"
                  secureTextEntry={!showDeliveryPassword}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowDeliveryPassword(!showDeliveryPassword)}
                >
                  <Ionicons name={showDeliveryPassword ? "eye-off" : "eye"} size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
              {deliveryManErrors.password && <Text style={styles.errorText}>{deliveryManErrors.password}</Text>}
            </View>

            <TouchableOpacity style={styles.addDeliveryButton} onPress={addDeliveryMan}>
              <Text style={styles.addDeliveryButtonText}>Add Delivery Man</Text>
            </TouchableOpacity>
          </View>

          {deliveryMen.map((dm, index) => (
            <View key={index} style={styles.deliveryManItem}>
              <View style={styles.deliveryManInfo}>
                <Text style={styles.deliveryManName}>{dm.name}</Text>
                <Text style={styles.deliveryManPhone}>{dm.phone}</Text>
              </View>
              <TouchableOpacity style={styles.removeButton} onPress={() => removeDeliveryMan(index)}>
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.registerButton, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.registerButtonText}>{loading ? "Registering..." : "Register Distributor"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    backgroundColor: "#2563eb",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    textAlign: "center",
    marginVertical: 24,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: "#F9FAFB",
    color: "#1F2937",
  },
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  passwordContainer: {
    position: "relative",
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingRight: 50,
    fontSize: 16,
    backgroundColor: "#F9FAFB",
    color: "#1F2937",
  },
  eyeButton: {
    position: "absolute",
    right: 16,
    top: 14,
    padding: 4,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
  },
  deliveryManForm: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#F9FAFB",
    marginBottom: 16,
  },
  addDeliveryButton: {
    backgroundColor: "#10B981",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  addDeliveryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  deliveryManItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  deliveryManInfo: {
    flex: 1,
  },
  deliveryManName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
  deliveryManPhone: {
    fontSize: 14,
    color: "#6B7280",
  },
  removeButton: {
    backgroundColor: "#EF4444",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  removeButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
  registerButton: {
    backgroundColor: "#5563EB",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginVertical: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
})

export default DistributorSignupScreen
