"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal } from "react-native"
import { useNavigation } from "@react-navigation/native"
import ApiService from "../../api/api-service"

interface DeliveryMan {
  name: string
  phone: string
  password: string
}

const DistributorSignupScreen = () => {
  const [formData, setFormData] = useState({
    agencyName: "",
    sapCode: "",
    adminName: "",
    password: "",
  })
  const [deliveryMen, setDeliveryMen] = useState<DeliveryMan[]>([])
  const [newDeliveryMan, setNewDeliveryMan] = useState<DeliveryMan>({
    name: "",
    phone: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const navigation = useNavigation()

  const addDeliveryMan = () => {
    if (newDeliveryMan.name && newDeliveryMan.phone && newDeliveryMan.password) {
      setDeliveryMen([...deliveryMen, newDeliveryMan])
      setNewDeliveryMan({ name: "", phone: "", password: "" })
    } else {
      Alert.alert("Error", "Please fill all delivery man details")
    }
  }

  const removeDeliveryMan = (index: number) => {
    setDeliveryMen(deliveryMen.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!formData.agencyName || !formData.sapCode || !formData.adminName || !formData.password) {
      Alert.alert("Error", "Please fill all required fields")
      return
    }

    try {
      setLoading(true)

      const response = await ApiService.registerDistributor({
        sapCode: formData.sapCode,
        agencyName: formData.agencyName,
        adminName: formData.adminName,
        password: formData.password,
        deliveryMen: deliveryMen,
      })

      if (response.success) {
        setShowSuccessModal(true)
      } else {
        Alert.alert("Error", response.error || "Registration failed")
      }
    } catch (error) {
      console.error("Registration error:", error)
      Alert.alert(
        "Error",
        "Registration failed. Please contact developer:\nEmail: anchaldesh7@gmail.com\nPhone: +91 7747865603",
      )
    } finally {
      setLoading(false)
    }
  }

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false)
    navigation.goBack()
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Register New Distributor</Text>

        {/* Main Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Agency Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gas Agency Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.agencyName}
              onChangeText={(text) => setFormData({ ...formData, agencyName: text })}
              placeholder="Enter agency name"
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>SAP Code *</Text>
            <TextInput
              style={styles.input}
              value={formData.sapCode}
              onChangeText={(text) => setFormData({ ...formData, sapCode: text })}
              placeholder="Enter SAP code"
              autoCapitalize="characters"
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Admin Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.adminName}
              onChangeText={(text) => setFormData({ ...formData, adminName: text })}
              placeholder="Enter admin name"
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password *</Text>
            <TextInput
              style={styles.input}
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              placeholder="Enter password"
              secureTextEntry
              editable={!loading}
            />
          </View>
        </View>

        {/* Delivery Men Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Register Delivery Men (Optional)</Text>

          <View style={styles.deliveryManForm}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={newDeliveryMan.name}
                onChangeText={(text) => setNewDeliveryMan({ ...newDeliveryMan, name: text })}
                placeholder="Enter delivery man name"
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={newDeliveryMan.phone}
                onChangeText={(text) => setNewDeliveryMan({ ...newDeliveryMan, phone: text })}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={newDeliveryMan.password}
                onChangeText={(text) => setNewDeliveryMan({ ...newDeliveryMan, password: text })}
                placeholder="Enter password"
                secureTextEntry
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={[styles.addButton, loading && styles.disabledButton]}
              onPress={addDeliveryMan}
              disabled={loading}
            >
              <Text style={styles.addButtonText}>Add Delivery Man</Text>
            </TouchableOpacity>
          </View>

          {/* Delivery Men List */}
          {deliveryMen.map((dm, index) => (
            <View key={index} style={styles.deliveryManItem}>
              <View style={styles.deliveryManInfo}>
                <Text style={styles.deliveryManName}>{dm.name}</Text>
                <Text style={styles.deliveryManPhone}>{dm.phone}</Text>
              </View>
              <TouchableOpacity
                style={[styles.removeButton, loading && styles.disabledButton]}
                onPress={() => removeDeliveryMan(index)}
                disabled={loading}
              >
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>{loading ? "Submitting..." : "Register Distributor"}</Text>
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleSuccessModalClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>✅ Registration Successful!</Text>
            <Text style={styles.modalMessage}>
              Your registration request has been submitted successfully. Please contact the administrator for approval
              to use the application.
            </Text>

            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Contact Information:</Text>
              <Text style={styles.contactText}>📧 Email: anchaldesh7@gmail.com</Text>
              <Text style={styles.contactText}>📞 Phone: +91 7747865603</Text>
            </View>

            <TouchableOpacity style={styles.modalButton} onPress={handleSuccessModalClose}>
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 24,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
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
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#F9FAFB",
  },
  deliveryManForm: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 16,
    backgroundColor: "#F9FAFB",
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: "#10B981",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  addButtonText: {
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
  submitButton: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxWidth: 400,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#10B981",
    marginBottom: 16,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    color: "#374151",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 20,
  },
  contactInfo: {
    backgroundColor: "#F0FDF4",
    borderRadius: 8,
    padding: 16,
    width: "100%",
    marginBottom: 20,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#15803D",
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: "#15803D",
    marginBottom: 4,
  },
  modalButton: {
    backgroundColor: "#2563EB",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
})

export default DistributorSignupScreen
