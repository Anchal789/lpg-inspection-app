"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Modal, Image } from "react-native"
import { useNavigation } from "@react-navigation/native"
import * as ImagePicker from "expo-image-picker"
import * as Location from "expo-location"
import { useData } from "../../context/DataContext"
import { useAuth } from "../../context/AuthContext"

const inspectionQuestions = [
  "Is Customer aware about 1906?",
  "Is cylinder in upright position?",
  "Is Hot Plate on a platform as compared with cylinder?",
  "Is there any crack on the connected Suraksha Hose?",
  "Is Suraksha Hose changed during inspection?",
  "Is customer using any other flame device or fuel or SKO in same kitchen?",
  "Is the DPR in use of same OMC as cylinder?",
  "Is the safety inspection has done?",
  "Is the customer wants to do servicing of the Hot Plate?",
  "Is hot plate with BSI mark?",
  "Does consumer wish to upgrade with Hi-star hotplate?",
  "Does consumer wish for portable kitchen platform?",
]

const NewInspection = () => {
  const navigation = useNavigation()
  const { addInspection, products } = useData()
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    consumerName: "",
    consumerNumber: "",
    mobileNumber: "",
    address: "",
    answers: {} as Record<number, string>,
    images: [] as string[],
    selectedProducts: [] as Array<{
      id: string
      name: string
      price: number
      quantity: number
      minPrice: number
      remainingQuantity: number
    }>,
    surakshaHoseDueDate: "",
    hotplateExchange: false,
    otherDiscount: 0,
  })

  const [showCamera, setShowCamera] = useState(false)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [customProduct, setCustomProduct] = useState({
    name: "",
    price: "",
    quantity: "",
  })

  const handleAnswerChange = (questionIndex: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionIndex]: value,
      },
    }))
  }

  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync()

    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "Camera permission is required to take photos")
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    })

    if (!result.canceled && result.assets[0]) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, result.assets[0].uri],
      }))
    }
    setShowCamera(false)
  }

  const addProductToList = (product: any, quantity: number, price: number) => {
    if (price < product.minPrice) {
      Alert.alert("Error", `Price cannot be below minimum price of ₹${product.minPrice}`)
      return
    }

    setFormData((prev) => ({
      ...prev,
      selectedProducts: [
        ...prev.selectedProducts,
        {
          ...product,
          quantity,
          price,
          remainingQuantity: product.quantity - quantity,
        },
      ],
    }))
  }

  const addCustomProduct = () => {
    if (!customProduct.name || !customProduct.price || !customProduct.quantity) {
      Alert.alert("Error", "Please fill all fields")
      return
    }

    const product = {
      id: Date.now().toString(),
      name: customProduct.name,
      price: Number.parseFloat(customProduct.price),
      quantity: Number.parseInt(customProduct.quantity),
      minPrice: 0,
      remainingQuantity: 0,
    }

    setFormData((prev) => ({
      ...prev,
      selectedProducts: [...prev.selectedProducts, product],
    }))

    setCustomProduct({ name: "", price: "", quantity: "" })
    setShowAddProduct(false)
  }

  const removeProduct = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      selectedProducts: prev.selectedProducts.filter((_, i) => i !== index),
    }))
  }

  const getTotalAmount = () => {
    const subtotal = formData.selectedProducts.reduce((sum, product) => sum + product.price * product.quantity, 0)
    const hotplateDiscount = formData.hotplateExchange ? 450 : 0
    const total = subtotal - hotplateDiscount - formData.otherDiscount
    return Math.max(0, total) // Ensure total is not negative
  }

  const getDiscountAmount = () => {
    const hotplateDiscount = formData.hotplateExchange ? 450 : 0
    return hotplateDiscount + formData.otherDiscount
  }

  const handleSubmit = async () => {
    // Validation
    if (!formData.consumerName || !formData.consumerNumber || !formData.mobileNumber || !formData.address) {
      Alert.alert("Error", "Please fill all consumer details")
      return
    }

    if (Object.keys(formData.answers).length < inspectionQuestions.length) {
      Alert.alert("Error", "Please answer all safety questions")
      return
    }

    if (formData.images.length === 0) {
      Alert.alert("Error", "Please capture at least one kitchen image")
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
        images: formData.images,
        products: formData.selectedProducts.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          quantity: p.quantity,
        })),
        totalAmount: getTotalAmount(),
        location,
      }

      addInspection(inspection)
      Alert.alert("Success", "Inspection submitted successfully!", [{ text: "OK", onPress: () => navigation.goBack() }])
    } catch (error) {
      Alert.alert("Error", "Failed to submit inspection. Please try again.")
    }
  }

  return (
    <ScrollView style={styles.container}>
      {/* Consumer Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Consumer Details</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Consumer Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.consumerName}
            onChangeText={(text) => setFormData({ ...formData, consumerName: text })}
            placeholder="Enter consumer name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Consumer Number *</Text>
          <TextInput
            style={styles.input}
            value={formData.consumerNumber}
            onChangeText={(text) => setFormData({ ...formData, consumerNumber: text })}
            placeholder="Enter consumer number"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mobile Number *</Text>
          <TextInput
            style={styles.input}
            value={formData.mobileNumber}
            onChangeText={(text) => setFormData({ ...formData, mobileNumber: text })}
            placeholder="Enter mobile number"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Address *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
            placeholder="Enter complete address"
            multiline
            numberOfLines={3}
          />
        </View>
      </View>

      {/* Safety Questions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Safety Inspection</Text>
        {inspectionQuestions.map((question, index) => (
          <View key={index} style={styles.questionContainer}>
            <Text style={styles.questionText}>
              {index + 1}. {question}
            </Text>
            <View style={styles.radioContainer}>
              <TouchableOpacity
                style={[styles.radioButton, formData.answers[index] === "yes" && styles.radioButtonSelected]}
                onPress={() => {
                  handleAnswerChange(index, "yes")
                  // Auto-add Hi-star hotplate if question 11 is yes
                  if (index === 10 && !formData.selectedProducts.find((p) => p.name === "Hi-star hotplate")) {
                    const hiStarHotplate = {
                      id: "histar_" + Date.now(),
                      name: "Hi-star hotplate",
                      price: 900,
                      quantity: 1,
                      minPrice: 900,
                      remainingQuantity: 0,
                    }
                    setFormData((prev) => ({
                      ...prev,
                      selectedProducts: [...prev.selectedProducts, hiStarHotplate],
                    }))
                  }
                  // Auto-add Portable Platform if question 12 is yes
                  if (index === 11 && !formData.selectedProducts.find((p) => p.name === "Portable Platform")) {
                    const portablePlatform = {
                      id: "platform_" + Date.now(),
                      name: "Portable Platform",
                      price: 0,
                      quantity: 0,
                      minPrice: 0,
                      remainingQuantity: 0,
                    }
                    setFormData((prev) => ({
                      ...prev,
                      selectedProducts: [...prev.selectedProducts, portablePlatform],
                    }))
                  }
                }}
              >
                <Text style={[styles.radioText, formData.answers[index] === "yes" && styles.radioTextSelected]}>
                  ✓ Yes
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.radioButton, formData.answers[index] === "no" && styles.radioButtonSelected]}
                onPress={() => {
                  handleAnswerChange(index, "no")
                  // Remove Hi-star hotplate if question 11 is no
                  if (index === 10) {
                    setFormData((prev) => ({
                      ...prev,
                      selectedProducts: prev.selectedProducts.filter((p) => p.name !== "Hi-star hotplate"),
                    }))
                  }
                  // Remove Portable Platform if question 12 is no
                  if (index === 11) {
                    setFormData((prev) => ({
                      ...prev,
                      selectedProducts: prev.selectedProducts.filter((p) => p.name !== "Portable Platform"),
                    }))
                  }
                }}
              >
                <Text style={[styles.radioText, formData.answers[index] === "no" && styles.radioTextSelected]}>
                  ✗ No
                </Text>
              </TouchableOpacity>
            </View>

            {/* Special date picker for question 5 (Suraksha Hose) */}
            {index === 4 && formData.answers[index] === "yes" && (
              <View style={styles.datePickerContainer}>
                <Text style={styles.dateLabel}>Suraksha Hose Due Date:</Text>
                <TextInput
                  style={styles.dateInput}
                  value={formData.surakshaHoseDueDate}
                  onChangeText={(date) => setFormData((prev) => ({ ...prev, surakshaHoseDueDate: date }))}
                  placeholder="DD/MM/YYYY"
                />
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Camera Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kitchen Images</Text>
        <TouchableOpacity style={styles.cameraButton} onPress={openCamera}>
          <Text style={styles.cameraButtonText}>📷 Take Photo</Text>
        </TouchableOpacity>

        {formData.images.length > 0 && (
          <View style={styles.imagesContainer}>
            {formData.images.map((image, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri: image }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => {
                    setFormData((prev) => ({
                      ...prev,
                      images: prev.images.filter((_, i) => i !== index),
                    }))
                  }}
                >
                  <Text style={styles.removeImageText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Products Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Products</Text>

        {/* Available Products */}
        <Text style={styles.subsectionTitle}>Available Products</Text>
        {products.map((product) => (
          <View key={product.id} style={styles.productCard}>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productDetails}>
                Price: ₹{product.price} | Min: ₹{product.minPrice} | Stock: {product.quantity}
              </Text>
            </View>
            <View style={styles.productInputs}>
              <TextInput
                style={styles.smallInput}
                placeholder="Qty"
                keyboardType="numeric"
                onChangeText={(qty) => {
                  if (qty) {
                    const quantity = Number.parseInt(qty)
                    addProductToList(product, quantity, product.price)
                  }
                }}
              />
            </View>
          </View>
        ))}

        {/* Add Custom Product */}
        <TouchableOpacity style={styles.addProductButton} onPress={() => setShowAddProduct(true)}>
          <Text style={styles.addProductButtonText}>+ Add Custom Product</Text>
        </TouchableOpacity>

        {/* Selected Products */}
        {formData.selectedProducts.length > 0 && (
          <>
            <Text style={styles.subsectionTitle}>Selected Products</Text>
            {formData.selectedProducts.map((product, index) => (
              <View key={index} style={styles.selectedProductCard}>
                <View style={styles.selectedProductInfo}>
                  <Text style={styles.selectedProductName}>{product.name}</Text>
                  <Text style={styles.selectedProductDetails}>
                    {product.quantity} × ₹{product.price} = ₹{product.quantity * product.price}
                  </Text>
                </View>
                <TouchableOpacity style={styles.removeProductButton} onPress={() => removeProduct(index)}>
                  <Text style={styles.removeProductText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}

            {/* Discount Section */}
            {formData.selectedProducts.length > 0 && (
              <View style={styles.discountSection}>
                <Text style={styles.subsectionTitle}>Discounts</Text>

                <View style={styles.discountRow}>
                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => setFormData((prev) => ({ ...prev, hotplateExchange: !prev.hotplateExchange }))}
                  >
                    <View style={[styles.checkbox, formData.hotplateExchange && styles.checkboxChecked]}>
                      {formData.hotplateExchange && <Text style={styles.checkboxText}>✓</Text>}
                    </View>
                    <Text style={styles.checkboxLabel}>Hot Plate Exchange (-₹450)</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Other Discount (₹)</Text>
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
            )}

            <View style={styles.totalContainer}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal:</Text>
                <Text style={styles.totalValue}>
                  ₹{formData.selectedProducts.reduce((sum, product) => sum + product.price * product.quantity, 0)}
                </Text>
              </View>
              {getDiscountAmount() > 0 && (
                <View style={styles.totalRow}>
                  <Text style={styles.discountLabel}>Total Discount:</Text>
                  <Text style={styles.discountValue}>-₹{getDiscountAmount()}</Text>
                </View>
              )}
              <View style={[styles.totalRow, styles.finalTotalRow]}>
                <Text style={styles.finalTotalLabel}>Final Total:</Text>
                <Text style={styles.finalTotalValue}>₹{getTotalAmount()}</Text>
              </View>
            </View>
          </>
        )}
      </View>

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit Inspection</Text>
      </TouchableOpacity>

      {/* Custom Product Modal */}
      <Modal
        visible={showAddProduct}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddProduct(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Custom Product</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Product Name</Text>
              <TextInput
                style={styles.input}
                value={customProduct.name}
                onChangeText={(text) => setCustomProduct({ ...customProduct, name: text })}
                placeholder="Enter product name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Price (₹)</Text>
              <TextInput
                style={styles.input}
                value={customProduct.price}
                onChangeText={(text) => setCustomProduct({ ...customProduct, price: text })}
                placeholder="0.00"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Quantity</Text>
              <TextInput
                style={styles.input}
                value={customProduct.quantity}
                onChangeText={(text) => setCustomProduct({ ...customProduct, quantity: text })}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddProduct(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={addCustomProduct}>
                <Text style={styles.saveButtonText}>Add Product</Text>
              </TouchableOpacity>
            </View>
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
    marginTop: 16,
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
  questionContainer: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  questionText: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 12,
    lineHeight: 20,
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
  cameraButton: {
    backgroundColor: "#2563EB",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  cameraButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  imagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#EF4444",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  removeImageText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  productCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
  },
  productDetails: {
    fontSize: 12,
    color: "#6B7280",
  },
  productInputs: {
    flexDirection: "row",
    gap: 8,
  },
  smallInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
    width: 60,
    textAlign: "center",
  },
  addProductButton: {
    backgroundColor: "#F59E0B",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  addProductButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  selectedProductCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  selectedProductInfo: {
    flex: 1,
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
  removeProductButton: {
    backgroundColor: "#EF4444",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  removeProductText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
  totalContainer: {
    backgroundColor: "#F0FDF4",
    borderRadius: 8,
    padding: 16,
    marginTop: 12,
    alignItems: "center",
  },
  totalText: {
    fontSize: 20,
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
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "500",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#10B981",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
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
})

export default NewInspection
