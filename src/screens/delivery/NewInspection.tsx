"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  Image,
  Linking,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import * as ImagePicker from "expo-image-picker"
import * as Location from "expo-location"
import { Ionicons } from "@expo/vector-icons"
import { useData } from "../../context/DataContext"
import { useAuth } from "../../context/AuthContext"

const inspectionQuestions = [
  {
    english: "Is Customer aware about 1906?",
    hindi: "क्या ग्राहक 1906 के बारे में जानता है?",
  },
  {
    english: "Is cylinder in upright position?",
    hindi: "क्या सिलेंडर सीधी स्थिति में है?",
  },
  {
    english: "Is Hot Plate on a platform as compared with cylinder?",
    hindi: "क्या हॉट प्लेट सिलेंडर की तुलना में प्लेटफॉर्म पर है?",
  },
  {
    english: "Is there any crack on the connected Suraksha Hose?",
    hindi: "क्या जुड़े हुए सुरक्षा होज़ पर कोई दरार है?",
  },
  {
    english: "Is Suraksha Hose changed during inspection?",
    hindi: "क्या निरीक्षण के दौरान सुरक्षा होज़ बदला गया है?",
  },
  {
    english: "Is customer using any other flame device or fuel or SKO in same kitchen?",
    hindi: "क्या ग्राहक उसी रसोई में कोई अन्य ज्वाला उपकरण या ईंधन या SKO का उपयोग कर रहा है?",
  },
  {
    english: "Is the DPR in use of same OMC as cylinder?",
    hindi: "क्या DPR सिलेंडर के समान OMC का उपयोग कर रहा है?",
  },
  {
    english: "Is the safety inspection has done?",
    hindi: "क्या सुरक्षा निरीक्षण हो गया है?",
  },
  {
    english: "Is the customer wants to do servicing of the Hot Plate?",
    hindi: "क्या ग्राहक हॉट प्लेट की सर्विसिंग कराना चाहता है?",
  },
  {
    english: "Is hot plate with BSI mark?",
    hindi: "क्या हॉट प्लेट BSI मार्क के साथ है?",
  },
  {
    english: "Does consumer wish to upgrade with Hi-star hotplate?",
    hindi: "क्या उपभोक्ता हाई-स्टार हॉटप्लेट के साथ अपग्रेड करना चाहता है?",
  },
  {
    english: "Does consumer wish for portable kitchen platform?",
    hindi: "क्या उपभोक्ता पोर्टेबल किचन प्लेटफॉर्म चाहता है?",
  },
]

const NewInspection = () => {
  const navigation = useNavigation()
  const { addInspection, products, appSettings, updateProductStock } = useData()
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    consumerName: "",
    consumerNumber: "",
    mobileNumber: "",
    address: "",
    answers: {} as Record<number, string>,
    image: "",
    selectedProducts: [] as Array<{
      id: string
      name: string
      price: number
      quantity: number
    }>,
    surakshaHoseDueDate: "",
    hotplateExchange: false,
    hotplateQuantity: 1,
    portablePlatformQuantity: 1,
    otherDiscount: 0,
  })

  const [errors, setErrors] = useState({})
  const [showImageModal, setShowImageModal] = useState(false)

  // Validation functions
  const validateConsumerName = (name: string) => {
    if (!name.trim()) return "Consumer name is required / उपभोक्ता का नाम आवश्यक है"
    if (name.length < 3)
      return "Consumer name must be at least 3 characters / उपभोक्ता का नाम कम से कम 3 अक्षरों का होना चाहिए"
    if (name.length > 40)
      return "Consumer name must not exceed 40 characters / उपभोक्ता का नाम 40 अक्षरों से अधिक नहीं होना चाहिए"
    return ""
  }

  const validateConsumerNumber = (number: string) => {
    if (!number.trim()) return "Consumer number is required / उपभोक्ता संख्या आवश्यक है"
    if (number.length < 6) return "Consumer number must be at least 6 digits / उपभोक्ता संख्या कम से कम 6 अंकों की होनी चाहिए"
    if (!/^\d+$/.test(number)) return "Consumer number must contain only numbers / उपभोक्ता संख्या में केवल संख्याएं होनी चाहिए"
    return ""
  }

  const validateMobileNumber = (mobile: string) => {
    if (!mobile.trim()) return "Mobile number is required / मोबाइल नंबर आवश्यक है"
    if (mobile.length !== 10) return "Mobile number must be exactly 10 digits / मोबाइल नंबर बिल्कुल 10 अंकों का होना चाहिए"
    if (!/^[6-9]\d{9}$/.test(mobile))
      return "Please enter a valid Indian mobile number / कृपया एक वैध भारतीय मोबाइल नंबर दर्ज करें"
    return ""
  }

  const validateAddress = (address: string) => {
    if (!address.trim()) return "Address is required / पता आवश्यक है"
    if (address.length < 3) return "Address must be at least 3 characters / पता कम से कम 3 अक्षरों का होना चाहिए"
    if (address.length > 150) return "Address must not exceed 150 characters / पता 150 अक्षरों से अधिक नहीं होना चाहिए"
    return ""
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })

    // Real-time validation
    let error = ""
    switch (field) {
      case "consumerName":
        error = validateConsumerName(value)
        break
      case "consumerNumber":
        error = validateConsumerNumber(value)
        break
      case "mobileNumber":
        error = validateMobileNumber(value)
        break
      case "address":
        error = validateAddress(value)
        break
    }

    setErrors({ ...errors, [field]: error })
  }

  const handleAnswerChange = (questionIndex: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionIndex]: value,
      },
    }))

    // Auto-add products based on answers
    if (questionIndex === 10 && value === "yes") {
      // Hi-star hotplate
      const hotplateProduct = {
        id: "hotplate_" + Date.now(),
        name: appSettings.hotplateName,
        price: appSettings.hotplatePrice,
        quantity: formData.hotplateQuantity,
      }
      setFormData((prev) => ({
        ...prev,
        selectedProducts: [...prev.selectedProducts.filter((p) => !p.name.includes("hotplate")), hotplateProduct],
      }))
    }

    if (questionIndex === 11 && value === "yes") {
      // Portable Platform
      const platformProduct = {
        id: "platform_" + Date.now(),
        name: appSettings.portablePlatformName,
        price: appSettings.portablePlatformPrice,
        quantity: formData.portablePlatformQuantity,
      }
      setFormData((prev) => ({
        ...prev,
        selectedProducts: [...prev.selectedProducts.filter((p) => !p.name.includes("Platform")), platformProduct],
      }))
    }

    // Remove products if answer changes to no
    if (questionIndex === 10 && value === "no") {
      setFormData((prev) => ({
        ...prev,
        selectedProducts: prev.selectedProducts.filter((p) => !p.name.includes("hotplate")),
      }))
    }

    if (questionIndex === 11 && value === "no") {
      setFormData((prev) => ({
        ...prev,
        selectedProducts: prev.selectedProducts.filter((p) => !p.name.includes("Platform")),
      }))
    }
  }

  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync()

    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission Required / अनुमति आवश्यक",
        "Camera permission is required to take photos / फोटो लेने के लिए कैमरा अनुमति आवश्यक है",
        [{ text: "OK / ठीक है" }],
      )
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false, // Remove crop functionality
      quality: 0.8,
    })

    if (!result.canceled && result.assets[0]) {
      setFormData((prev) => ({
        ...prev,
        image: result.assets[0].uri,
      }))
      setErrors({ ...errors, image: "" })
    }
  }

  const handleMobilePress = (mobile: string) => {
    Alert.alert(
      "Call Consumer / उपभोक्ता को कॉल करें",
      `Do you want to call ${mobile}? / क्या आप ${mobile} पर कॉल करना चाहते हैं?`,
      [
        { text: "Cancel / रद्द करें", style: "cancel" },
        { text: "Call / कॉल करें", onPress: () => Linking.openURL(`tel:${mobile}`) },
      ],
    )
  }

  const getTotalAmount = () => {
    const subtotal = formData.selectedProducts.reduce((sum, product) => sum + product.price * product.quantity, 0)
    const hotplateDiscount = formData.hotplateExchange ? appSettings.hotplateExchangeRate : 0
    const total = subtotal - hotplateDiscount - formData.otherDiscount
    return Math.max(0, total)
  }

  const handleSubmit = async () => {
    // Validate all fields
    const nameError = validateConsumerName(formData.consumerName)
    const numberError = validateConsumerNumber(formData.consumerNumber)
    const mobileError = validateMobileNumber(formData.mobileNumber)
    const addressError = validateAddress(formData.address)

    const newErrors = {
      consumerName: nameError,
      consumerNumber: numberError,
      mobileNumber: mobileError,
      address: addressError,
      image: !formData.image ? "Image is required / छवि आवश्यक है" : "",
    }

    setErrors(newErrors)

    // Check if all questions are answered
    const unansweredQuestions = inspectionQuestions.filter((_, index) => !formData.answers[index])
    if (unansweredQuestions.length > 0) {
      Alert.alert(
        "Incomplete Form / अधूरा फॉर्म",
        "Please answer all safety questions / कृपया सभी सुरक्षा प्रश्नों का उत्तर दें",
        [{ text: "OK / ठीक है" }],
      )
      return
    }

    if (nameError || numberError || mobileError || addressError || !formData.image) {
      Alert.alert(
        "Validation Error / सत्यापन त्रुटि",
        "Please fix all errors before submitting / सबमिट करने से पहले सभी त्रुटियों को ठीक करें",
        [{ text: "OK / ठीक है" }],
      )
      return
    }

    try {
      // Get location
      const { status } = await Location.requestForegroundPermissionsAsync()
      let location = { latitude: 0, longitude: 0 }

      if (status === "granted") {
        const currentLocation = await Location.getCurrentPositionAsync({})
        location = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        }
      }

      // Check product stock before submitting
      for (const product of formData.selectedProducts) {
        const availableProduct = products.find((p) => p.id === product.id)
        if (availableProduct) {
          const remainingStock =
            availableProduct.quantity - (availableProduct.soldQuantity || 0) - (availableProduct.assignedQuantity || 0)
          if (product.quantity > remainingStock) {
            Alert.alert(
              "Insufficient Stock / अपर्याप्त स्टॉक",
              `Only ${remainingStock} units of ${product.name} available. Contact admin to assign more stock. / ${product.name} की केवल ${remainingStock} इकाइयां उपलब्ध हैं। अधिक स्टॉक असाइन करने के लिए व्यवस्थापक से संपर्क करें।`,
              [{ text: "OK / ठीक है" }],
            )
            return
          }
        }
      }

      const inspection = {
        id: Date.now().toString(),
        consumerName: formData.consumerName,
        consumerNumber: formData.consumerNumber,
        mobileNumber: formData.mobileNumber,
        address: formData.address,
        deliveryManId: user?.id || "",
        deliveryManName: user?.name || "",
        date: new Date().toISOString(),
        answers: formData.answers,
        images: [formData.image],
        products: formData.selectedProducts,
        totalAmount: getTotalAmount(),
        location,
        surakshaHoseDueDate: formData.surakshaHoseDueDate,
        hotplateExchange: formData.hotplateExchange,
        otherDiscount: formData.otherDiscount,
      }

      addInspection(inspection)

      Alert.alert("Success / सफलता", "Inspection submitted successfully! / निरीक्षण सफलतापूर्वक सबमिट किया गया!", [
        {
          text: "OK / ठीक है",
          onPress: () => navigation.goBack(),
        },
      ])
    } catch (error) {
      Alert.alert(
        "Error / त्रुटि",
        "Failed to submit inspection. Please try again. / निरीक्षण सबमिट करने में असफल। कृपया पुनः प्रयास करें।",
        [{ text: "OK / ठीक है" }],
      )
    }
  }

  return (
    <ScrollView style={styles.container}>
      {/* Consumer Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Consumer Details / उपभोक्ता विवरण</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Consumer Name / उपभोक्ता का नाम *</Text>
          <TextInput
            style={[styles.input, errors.consumerName && styles.inputError]}
            value={formData.consumerName}
            onChangeText={(text) => handleInputChange("consumerName", text)}
            placeholder="Enter consumer name / उपभोक्ता का नाम दर्ज करें"
          />
          {errors.consumerName ? <Text style={styles.errorText}>{errors.consumerName}</Text> : null}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Consumer Number / उपभोक्ता संख्या *</Text>
          <TextInput
            style={[styles.input, errors.consumerNumber && styles.inputError]}
            value={formData.consumerNumber}
            onChangeText={(text) => handleInputChange("consumerNumber", text)}
            placeholder="Enter consumer number / उपभोक्ता संख्या दर्ज करें"
            keyboardType="numeric"
          />
          {errors.consumerNumber ? <Text style={styles.errorText}>{errors.consumerNumber}</Text> : null}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mobile Number / मोबाइल नंबर *</Text>
          <TouchableOpacity onPress={() => formData.mobileNumber && handleMobilePress(formData.mobileNumber)}>
            <TextInput
              style={[styles.input, errors.mobileNumber && styles.inputError]}
              value={formData.mobileNumber}
              onChangeText={(text) => handleInputChange("mobileNumber", text)}
              placeholder="Enter mobile number / मोबाइल नंबर दर्ज करें"
              keyboardType="phone-pad"
              maxLength={10}
              editable={true}
            />
          </TouchableOpacity>
          {errors.mobileNumber ? <Text style={styles.errorText}>{errors.mobileNumber}</Text> : null}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Address / पता *</Text>
          <TextInput
            style={[styles.input, styles.textArea, errors.address && styles.inputError]}
            value={formData.address}
            onChangeText={(text) => handleInputChange("address", text)}
            placeholder="Enter complete address / पूरा पता दर्ज करें"
            multiline
            numberOfLines={3}
          />
          {errors.address ? <Text style={styles.errorText}>{errors.address}</Text> : null}
        </View>
      </View>

      {/* Safety Questions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Safety Inspection / सुरक्षा निरीक्षण</Text>
        {inspectionQuestions.map((question, index) => (
          <View key={index} style={styles.questionContainer}>
            <Text style={styles.questionText}>
              {index + 1}. {question.english}
            </Text>
            <Text style={styles.questionTextHindi}>{question.hindi}</Text>
            <View style={styles.radioContainer}>
              <TouchableOpacity
                style={[styles.radioButton, formData.answers[index] === "yes" && styles.radioButtonSelected]}
                onPress={() => handleAnswerChange(index, "yes")}
              >
                <Text style={[styles.radioText, formData.answers[index] === "yes" && styles.radioTextSelected]}>
                  ✓ Yes / हाँ
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.radioButton, formData.answers[index] === "no" && styles.radioButtonSelected]}
                onPress={() => handleAnswerChange(index, "no")}
              >
                <Text style={[styles.radioText, formData.answers[index] === "no" && styles.radioTextSelected]}>
                  ✗ No / नहीं
                </Text>
              </TouchableOpacity>
            </View>

            {/* Special date picker for question 5 (Suraksha Hose) */}
            {index === 4 && formData.answers[index] === "yes" && (
              <View style={styles.datePickerContainer}>
                <Text style={styles.dateLabel}>Suraksha Hose Due Date / सुरक्षा होज़ की नियत तारीख:</Text>
                <TextInput
                  style={styles.dateInput}
                  value={formData.surakshaHoseDueDate}
                  onChangeText={(date) => setFormData((prev) => ({ ...prev, surakshaHoseDueDate: date }))}
                  placeholder="DD/MM/YYYY"
                />
              </View>
            )}

            {/* Hotplate quantity input */}
            {index === 10 && formData.answers[index] === "yes" && (
              <View style={styles.quantityContainer}>
                <Text style={styles.quantityLabel}>{appSettings.hotplateName} Quantity / मात्रा:</Text>
                <TextInput
                  style={styles.quantityInput}
                  value={formData.hotplateQuantity.toString()}
                  onChangeText={(qty) => {
                    const quantity = Number.parseInt(qty) || 1
                    setFormData((prev) => ({ ...prev, hotplateQuantity: quantity }))
                    // Update product in selectedProducts
                    const hotplateProduct = {
                      id: "hotplate_" + Date.now(),
                      name: appSettings.hotplateName,
                      price: appSettings.hotplatePrice,
                      quantity: quantity,
                    }
                    setFormData((prev) => ({
                      ...prev,
                      selectedProducts: [
                        ...prev.selectedProducts.filter((p) => !p.name.includes("hotplate")),
                        hotplateProduct,
                      ],
                    }))
                  }}
                  keyboardType="numeric"
                />
                <Text style={styles.priceText}>₹{appSettings.hotplatePrice} each</Text>
              </View>
            )}

            {/* Platform quantity input */}
            {index === 11 && formData.answers[index] === "yes" && (
              <View style={styles.quantityContainer}>
                <Text style={styles.quantityLabel}>{appSettings.portablePlatformName} Quantity / मात्रा:</Text>
                <TextInput
                  style={styles.quantityInput}
                  value={formData.portablePlatformQuantity.toString()}
                  onChangeText={(qty) => {
                    const quantity = Number.parseInt(qty) || 1
                    setFormData((prev) => ({ ...prev, portablePlatformQuantity: quantity }))
                    // Update product in selectedProducts
                    const platformProduct = {
                      id: "platform_" + Date.now(),
                      name: appSettings.portablePlatformName,
                      price: appSettings.portablePlatformPrice,
                      quantity: quantity,
                    }
                    setFormData((prev) => ({
                      ...prev,
                      selectedProducts: [
                        ...prev.selectedProducts.filter((p) => !p.name.includes("Platform")),
                        platformProduct,
                      ],
                    }))
                  }}
                  keyboardType="numeric"
                />
                <Text style={styles.priceText}>₹{appSettings.portablePlatformPrice} each</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Kitchen Image */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kitchen Image / रसोई की छवि</Text>
        <TouchableOpacity style={styles.cameraButton} onPress={openCamera}>
          <Ionicons name="camera" size={24} color="#FFFFFF" />
          <Text style={styles.cameraButtonText}>Take Photo / फोटो लें</Text>
        </TouchableOpacity>
        {errors.image ? <Text style={styles.errorText}>{errors.image}</Text> : null}

        {formData.image && (
          <TouchableOpacity onPress={() => setShowImageModal(true)}>
            <Image source={{ uri: formData.image }} style={styles.previewImage} />
          </TouchableOpacity>
        )}
      </View>

      {/* Products Section */}
      {formData.selectedProducts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selected Products / चयनित उत्पाद</Text>
          {formData.selectedProducts.map((product, index) => (
            <View key={index} style={styles.selectedProductCard}>
              <Text style={styles.selectedProductName}>{product.name}</Text>
              <Text style={styles.selectedProductDetails}>
                {product.quantity} × ₹{product.price} = ₹{product.quantity * product.price}
              </Text>
            </View>
          ))}

          {/* Discount Section */}
          <View style={styles.discountSection}>
            <Text style={styles.subsectionTitle}>Discounts / छूट</Text>

            <View style={styles.discountRow}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setFormData((prev) => ({ ...prev, hotplateExchange: !prev.hotplateExchange }))}
              >
                <View style={[styles.checkbox, formData.hotplateExchange && styles.checkboxChecked]}>
                  {formData.hotplateExchange && <Text style={styles.checkboxText}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Hot Plate Exchange (-₹{appSettings.hotplateExchangeRate})</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Other Discount (₹) / अन्य छूट (₹)</Text>
              <TextInput
                style={styles.input}
                value={formData.otherDiscount.toString()}
                onChangeText={(value) =>
                  setFormData((prev) => ({ ...prev, otherDiscount: Number.parseFloat(value) || 0 }))
                }
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.totalContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal / उप-योग:</Text>
              <Text style={styles.totalValue}>
                ₹{formData.selectedProducts.reduce((sum, product) => sum + product.price * product.quantity, 0)}
              </Text>
            </View>
            {(formData.hotplateExchange || formData.otherDiscount > 0) && (
              <View style={styles.totalRow}>
                <Text style={styles.discountLabel}>Total Discount / कुल छूट:</Text>
                <Text style={styles.discountValue}>
                  -₹{(formData.hotplateExchange ? appSettings.hotplateExchangeRate : 0) + formData.otherDiscount}
                </Text>
              </View>
            )}
            <View style={[styles.totalRow, styles.finalTotalRow]}>
              <Text style={styles.finalTotalLabel}>Final Total / अंतिम योग:</Text>
              <Text style={styles.finalTotalValue}>₹{getTotalAmount()}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit Inspection / निरीक्षण सबमिट करें</Text>
      </TouchableOpacity>

      {/* Image Modal */}
      <Modal
        visible={showImageModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowImageModal(false)}
      >
        <View style={styles.imageModalOverlay}>
          <View style={styles.imageModalContent}>
            <TouchableOpacity style={styles.imageModalClose} onPress={() => setShowImageModal(false)}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Image source={{ uri: formData.image }} style={styles.fullImage} />
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
  section: {
    backgroundColor: "#FFFFFF",
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 12,
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
  textArea: {
    height: 80,
    textAlignVertical: "top",
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
  questionContainer: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  questionText: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
    lineHeight: 20,
    fontWeight: "500",
  },
  questionTextHindi: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 12,
    lineHeight: 18,
  },
  radioContainer: {
    flexDirection: "row",
    gap: 12,
  },
  radioButton: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  radioButtonSelected: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  radioText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  radioTextSelected: {
    color: "#FFFFFF",
  },
  datePickerContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F59E0B",
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#92400E",
    marginBottom: 6,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: "#F59E0B",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: "#FFFFFF",
  },
  quantityContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DBEAFE",
    flexDirection: "row",
    alignItems: "center",
  },
  quantityLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1E40AF",
    flex: 1,
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: "#DBEAFE",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: "#FFFFFF",
    width: 60,
    textAlign: "center",
    marginHorizontal: 8,
  },
  priceText: {
    fontSize: 12,
    color: "#1E40AF",
    fontWeight: "500",
  },
  cameraButton: {
    backgroundColor: "#2563EB",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  cameraButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginTop: 8,
  },
  selectedProductCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  selectedProductName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
  },
  selectedProductDetails: {
    fontSize: 14,
    color: "#2563EB",
  },
  discountSection: {
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  discountRow: {
    marginBottom: 12,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    borderRadius: 4,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  checkboxText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  totalContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: "#374151",
  },
  totalValue: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },
  discountLabel: {
    fontSize: 16,
    color: "#EF4444",
  },
  discountValue: {
    fontSize: 16,
    color: "#EF4444",
    fontWeight: "500",
  },
  finalTotalRow: {
    borderTopWidth: 2,
    borderTopColor: "#10B981",
    paddingTop: 8,
    marginTop: 8,
  },
  finalTotalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#15803D",
  },
  finalTotalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#15803D",
  },
  submitButton: {
    backgroundColor: "#10B981",
    margin: 16,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  imageModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageModalContent: {
    width: "90%",
    height: "80%",
    position: "relative",
  },
  imageModalClose: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    padding: 8,
  },
  fullImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
})

export default NewInspection
