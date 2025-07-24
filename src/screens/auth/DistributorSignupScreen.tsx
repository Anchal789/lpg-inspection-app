"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
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
  const [errors, setErrors] = useState({})
  const [deliveryManErrors, setDeliveryManErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showDeliveryPassword, setShowDeliveryPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const navigation = useNavigation()

  // Validation functions
  const validateSapCode = (code: string) => {
    if (!code.trim()) return "SAP code is required / SAP कोड आवश्यक है"
    if (code.length < 5) return "SAP code must be at least 5 characters / SAP कोड कम से कम 5 अक्षरों का होना चाहिए"
    if (code.length > 10) return "SAP code must not exceed 10 characters / SAP कोड 10 अक्षरों से अधिक नहीं होना चाहिए"
    return ""
  }

  const validateAgencyName = (name: string) => {
    if (!name.trim()) return "Agency name is required / एजेंसी का नाम आवश्यक है"
    if (name.length < 3) return "Agency name must be at least 3 characters / एजेंसी का नाम कम से कम 3 अक्षरों का होना चाहिए"
    if (name.length > 40)
      return "Agency name must not exceed 40 characters / एजेंसी का नाम 40 अक्षरों से अधिक नहीं होना चाहिए"
    return ""
  }

  const validateAdminName = (name: string) => {
    if (!name.trim()) return "Admin name is required / व्यवस्थापक का नाम आवश्यक है"
    if (name.length < 3)
      return "Admin name must be at least 3 characters / व्यवस्थापक का नाम कम से कम 3 अक्षरों का होना चाहिए"
    if (name.length > 40)
      return "Admin name must not exceed 40 characters / व्यवस्थापक का नाम 40 अक्षरों से अधिक नहीं होना चाहिए"
    return ""
  }

  const validatePassword = (password: string) => {
    if (!password.trim()) return "Password is required / पासवर्ड आवश्यक है"
    if (password.length < 4) return "Password must be at least 4 characters / पासवर्ड कम से कम 4 अक्षरों का होना चाहिए"
    if (!/^[a-zA-Z0-9]+$/.test(password))
      return "Password can only contain letters and numbers / पासवर्ड में केवल अक्षर और संख्याएं हो सकती हैं"
    return ""
  }

  const validateDeliveryManName = (name: string) => {
    if (!name.trim()) return "Name is required / नाम आवश्यक है"
    if (name.length < 3) return "Name must be at least 3 characters / नाम कम से कम 3 अक्षरों का होना चाहिए"
    if (name.length > 40) return "Name must not exceed 40 characters / नाम 40 अक्षरों से अधिक नहीं होना चाहिए"
    return ""
  }

  const validateDeliveryManPhone = (phone: string) => {
    if (!phone.trim()) return "Phone number is required / फोन नंबर आवश्यक है"
    if (phone.length !== 10) return "Phone number must be exactly 10 digits / फोन नंबर बिल्कुल 10 अंकों का होना चाहिए"
    if (!/^[6-9]\d{9}$/.test(phone))
      return "Please enter a valid Indian mobile number / कृपया एक वैध भारतीय मोबाइल नंबर दर्ज करें"
    return ""
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })

    // Real-time validation
    let error = ""
    switch (field) {
      case "sapCode":
        error = validateSapCode(value)
        break
      case "agencyName":
        error = validateAgencyName(value)
        break
      case "adminName":
        error = validateAdminName(value)
        break
      case "password":
        error = validatePassword(value)
        break
    }

    setErrors({ ...errors, [field]: error })
  }

  const handleDeliveryManChange = (field: string, value: string) => {
    setNewDeliveryMan({ ...newDeliveryMan, [field]: value })

    // Real-time validation
    let error = ""
    switch (field) {
      case "name":
        error = validateDeliveryManName(value)
        break
      case "phone":
        error = validateDeliveryManPhone(value)
        break
      case "password":
        error = validatePassword(value)
        break
    }

    setDeliveryManErrors({ ...deliveryManErrors, [field]: error })
  }

  const addDeliveryMan = () => {
    const nameError = validateDeliveryManName(newDeliveryMan.name)
    const phoneError = validateDeliveryManPhone(newDeliveryMan.phone)
    const passwordError = validatePassword(newDeliveryMan.password)

    const newErrors = {
      name: nameError,
      phone: phoneError,
      password: passwordError,
    }

    setDeliveryManErrors(newErrors)

    if (nameError || phoneError || passwordError) {
      return
    }

    // Check for duplicate phone numbers
    if (deliveryMen.some((dm) => dm.phone === newDeliveryMan.phone)) {
      Alert.alert(
        "Duplicate Phone Number / डुप्लिकेट फोन नंबर",
        "This phone number is already added / यह फोन नंबर पहले से जोड़ा गया है",
        [{ text: "OK / ठीक है" }],
      )
      return
    }

    setDeliveryMen([...deliveryMen, newDeliveryMan])
    setNewDeliveryMan({ name: "", phone: "", password: "" })
    setDeliveryManErrors({})
  }

  const removeDeliveryMan = (index: number) => {
    setDeliveryMen(deliveryMen.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    // Validate main form
    const sapCodeError = validateSapCode(formData.sapCode)
    const agencyNameError = validateAgencyName(formData.agencyName)
    const adminNameError = validateAdminName(formData.adminName)
    const passwordError = validatePassword(formData.password)

    const newErrors = {
      sapCode: sapCodeError,
      agencyName: agencyNameError,
      adminName: adminNameError,
      password: passwordError,
    }

    setErrors(newErrors)

    if (sapCodeError || agencyNameError || adminNameError || passwordError) {
      Alert.alert(
        "Validation Error / सत्यापन त्रुटि",
        "Please fix all errors before submitting / सबमिट करने से पहले सभी त्रुटियों को ठीक करें",
        [{ text: "OK / ठीक है" }],
      )
      return
    }

    setLoading(true)
    try {
      const response = await ApiService.registerDistributor({
        sapCode: formData.sapCode.toUpperCase(),
        agencyName: formData.agencyName,
        adminName: formData.adminName,
        password: formData.password,
        deliveryMen: deliveryMen,
      })

      if (response.success) {
        setShowSuccessModal(true)
      } else {
        Alert.alert("Registration Failed / पंजीकरण असफल", response.error || "Registration failed / पंजीकरण असफल", [
          { text: "OK / ठीक है" },
        ])
      }
    } catch (error) {
      Alert.alert("Network Error / नेटवर्क त्रुटि", "Please check your internet connection / कृपया अपना इंटरनेट कनेक्शन जांचें", [
        { text: "OK / ठीक है" },
      ])
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
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Register Distributor / वितरक पंजीकरण</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Register New Distributor</Text>
        <Text style={styles.subtitle}>नया वितरक पंजीकरण</Text>

        {/* Main Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Agency Details / एजेंसी विवरण</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gas Agency Name / गैस एजेंसी का नाम *</Text>
            <TextInput
              style={[styles.input, errors.agencyName && styles.inputError]}
              value={formData.agencyName}
              onChangeText={(text) => handleInputChange("agencyName", text)}
              placeholder="Enter agency name / एजेंसी का नाम दर्ज करें"
              editable={!loading}
            />
            {errors.agencyName ? <Text style={styles.errorText}>{errors.agencyName}</Text> : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>SAP Code / SAP कोड *</Text>
            <TextInput
              style={[styles.input, errors.sapCode && styles.inputError]}
              value={formData.sapCode}
              onChangeText={(text) => handleInputChange("sapCode", text.toUpperCase())}
              placeholder="Enter SAP code / SAP कोड दर्ज करें"
              autoCapitalize="characters"
              maxLength={10}
              editable={!loading}
            />
            {errors.sapCode ? <Text style={styles.errorText}>{errors.sapCode}</Text> : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Admin Name / व्यवस्थापक का नाम *</Text>
            <TextInput
              style={[styles.input, errors.adminName && styles.inputError]}
              value={formData.adminName}
              onChangeText={(text) => handleInputChange("adminName", text)}
              placeholder="Enter admin name / व्यवस्थापक का नाम दर्ज करें"
              editable={!loading}
            />
            {errors.adminName ? <Text style={styles.errorText}>{errors.adminName}</Text> : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password / पासवर्ड *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.passwordInput, errors.password && styles.inputError]}
                value={formData.password}
                onChangeText={(text) => handleInputChange("password", text)}
                placeholder="Enter password / पासवर्ड दर्ज करें"
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
          </View>
        </View>

        {/* Delivery Men Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Register Delivery Men (Optional) / डिलीवरी मैन पंजीकरण (वैकल्पिक)</Text>

          <View style={styles.deliveryManForm}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name / नाम</Text>
              <TextInput
                style={[styles.input, deliveryManErrors.name && styles.inputError]}
                value={newDeliveryMan.name}
                onChangeText={(text) => handleDeliveryManChange("name", text)}
                placeholder="Enter delivery man name / डिलीवरी मैन का नाम दर्ज करें"
                editable={!loading}
              />
              {deliveryManErrors.name ? <Text style={styles.errorText}>{deliveryManErrors.name}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number / फोन नंबर</Text>
              <TextInput
                style={[styles.input, deliveryManErrors.phone && styles.inputError]}
                value={newDeliveryMan.phone}
                onChangeText={(text) => handleDeliveryManChange("phone", text)}
                placeholder="Enter phone number / फोन नंबर दर्ज करें"
                keyboardType="phone-pad"
                maxLength={10}
                editable={!loading}
              />
              {deliveryManErrors.phone ? <Text style={styles.errorText}>{deliveryManErrors.phone}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password / पासवर्ड</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.passwordInput, deliveryManErrors.password && styles.inputError]}
                  value={newDeliveryMan.password}
                  onChangeText={(text) => handleDeliveryManChange("password", text)}
                  placeholder="Enter password / पासवर्ड दर्ज करें"
                  secureTextEntry={!showDeliveryPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowDeliveryPassword(!showDeliveryPassword)}
                >
                  <Ionicons name={showDeliveryPassword ? "eye-off" : "eye"} size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
              {deliveryManErrors.password ? <Text style={styles.errorText}>{deliveryManErrors.password}</Text> : null}
            </View>

            <TouchableOpacity
              style={[styles.addButton, loading && styles.disabledButton]}
              onPress={addDeliveryMan}
              disabled={loading}
            >
              <Text style={styles.addButtonText}>Add Delivery Man / डिलीवरी मैन जोड़ें</Text>
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
                <Text style={styles.removeButtonText}>Remove / हटाएं</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? "Submitting... / सबमिट कर रहे हैं..." : "Register Distributor / वितरक पंजीकरण"}
          </Text>
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
            <Ionicons name="checkmark-circle" size={60} color="#10B981" />
            <Text style={styles.modalTitle}>Registration Successful! / पंजीकरण सफल!</Text>
            <Text style={styles.modalMessage}>
              Your registration request has been submitted successfully. Please contact the administrator for approval
              to use the application.
            </Text>
            <Text style={styles.modalMessageHindi}>
              आपका पंजीकरण अनुरोध सफलतापूर्वक सबमिट हो गया है। एप्लिकेशन का उपयोग करने के लिए कृपया अनुमोदन के लिए व्यवस्थापक से संपर्क
              करें।
            </Text>

            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Contact Information / संपर्क जानकारी:</Text>
              <Text style={styles.contactText}>📧 Email: anchaldesh7@gmail.com</Text>
              <Text style={styles.contactText}>📞 Phone: +91 7747865603</Text>
            </View>

            <TouchableOpacity style={styles.modalButton} onPress={handleSuccessModalClose}>
              <Text style={styles.modalButtonText}>OK / ठीक है</Text>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
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
  passwordContainer: {
    position: "relative",
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingRight: 50,
    fontSize: 16,
    backgroundColor: "#F9FAFB",
  },
  eyeButton: {
    position: "absolute",
    right: 12,
    top: 10,
    padding: 4,
  },
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
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
    marginTop: 16,
  },
  modalMessage: {
    fontSize: 16,
    color: "#374151",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 8,
  },
  modalMessageHindi: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
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
