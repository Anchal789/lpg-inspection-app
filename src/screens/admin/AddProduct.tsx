"use client"

import { useState, useEffect } from "react"
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Alert, 
  Modal,
  Dimensions,
  KeyboardAvoidingView,
  Platform
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useData } from "../../context/DataContext"
import { useAuth } from "../../context/AuthContext"

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

const AddProduct = () => {
  const navigation = useNavigation()
  const { products, deliveryMen, addProduct, updateProduct, deleteProduct, assignProductToDeliveryMan, refreshData } = useData()
  const { token } = useAuth()
  
  // Modal and form states
  const [modalVisible, setModalVisible] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [productName, setProductName] = useState("")
  const [price, setPrice] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [stock, setStock] = useState("")
  const [loading, setLoading] = useState(false)
  
  // Validation error states
  const [errors, setErrors] = useState({
    productName: "",
    price: "",
    minPrice: "",
    stock: ""
  })

  useEffect(() => {
    refreshData()
  }, [])

  const clearForm = () => {
    setProductName("")
    setPrice("")
    setMinPrice("")
    setStock("")
    setEditMode(false)
    setEditingProduct(null)
    setErrors({
      productName: "",
      price: "",
      minPrice: "",
      stock: ""
    })
  }

  const openModal = () => {
    clearForm()
    setModalVisible(true)
  }

  const openEditModal = (product) => {
    setEditMode(true)
    setEditingProduct(product)
    setProductName(product.name || "")
    setPrice(product.price?.toString() || "")
    setMinPrice(product.minPrice?.toString() || "")
    setStock((product.quantity || product.stock || 0).toString())
    setModalVisible(true)
  }

  const closeModal = () => {
    setModalVisible(false)
    clearForm()
  }

  const validateField = (field, value, allValues = {}) => {
    let error = ""
    
    switch (field) {
      case 'productName':
        if (!value.trim()) {
          error = "Product name is required"
        }
        break
        
      case 'price':
        if (!value) {
          error = "Price is required"
        } else if (isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
          error = "Please enter a valid price"
        }
        break
        
      case 'minPrice':
        if (!value) {
          error = "Minimum price is required"
        } else if (isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
          error = "Please enter a valid minimum price"
        } else if (allValues.price && parseFloat(value) > parseFloat(allValues.price)) {
          error = "Minimum price cannot be greater than selling price"
        }
        break
        
      case 'stock':
        if (!value) {
          error = "Stock is required"
        } else if (isNaN(parseInt(value)) || parseInt(value) < 0) {
          error = "Please enter a valid stock quantity"
        }
        break
    }
    
    return error
  }

  const validateAllFields = () => {
    const allValues = { productName, price, minPrice, stock }
    const newErrors = {}
    
    Object.keys(allValues).forEach(field => {
      newErrors[field] = validateField(field, allValues[field], allValues)
    })
    
    setErrors(newErrors)
    
    // Return true if no errors
    return Object.values(newErrors).every(error => error === "")
  }

  const handleFieldChange = (field, value) => {
    // Update the field value
    switch (field) {
      case 'productName':
        setProductName(value)
        break
      case 'price':
        setPrice(value)
        break
      case 'minPrice':
        setMinPrice(value)
        break
      case 'stock':
        setStock(value)
        break
    }

    // Clear the error for this field and validate
    const allValues = { 
      productName: field === 'productName' ? value : productName,
      price: field === 'price' ? value : price,
      minPrice: field === 'minPrice' ? value : minPrice,
      stock: field === 'stock' ? value : stock
    }
    
    const fieldError = validateField(field, value, allValues)
    setErrors(prev => ({ ...prev, [field]: fieldError }))
    
    // Special case: if price changes, re-validate minPrice
    if (field === 'price' && minPrice) {
      const minPriceError = validateField('minPrice', minPrice, allValues)
      setErrors(prev => ({ ...prev, minPrice: minPriceError }))
    }
  }

  const handleAddProduct = async () => {
    if (!validateAllFields()) {
      return
    }

    setLoading(true)
    try {
      const newProduct = {
        name: productName.trim(),
        price: parseFloat(price),
        minPrice: parseFloat(minPrice),
        quantity: parseInt(stock),
        type: "other",
        status: "active"
      }

      console.log("Sending product payload:", newProduct)

      const result = await addProduct(newProduct)
      
      if (result && result.success !== false) {
        closeModal()
        Alert.alert(
          "Success", 
          "Product added successfully",
          [
            {
              text: "OK",
              onPress: () => {
                refreshData()
              }
            }
          ]
        )
      } else {
        const errorMessage = result?.error || result?.message || "Failed to add product. Please try again."
        Alert.alert("Error", errorMessage)
      }
    } catch (error) {
      console.error("Add product error:", error)
      let errorMessage = "Failed to add product. Please try again."
      
      if (error.message) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
      Alert.alert("Error", errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProduct = async () => {
    if (!validateAllFields()) {
      return
    }

    setLoading(true)
    try {
      const updatedProduct = {
        name: productName.trim(),
        price: parseFloat(price),
        minPrice: parseFloat(minPrice),
        quantity: parseInt(stock),
        type: editingProduct.type || "other",
        status: "active"
      }

      console.log("Updating product with payload:", updatedProduct)

      const result = await updateProduct(editingProduct.id || editingProduct._id, updatedProduct)
      
      if (result && result.success !== false) {
        closeModal()
        Alert.alert(
          "Success", 
          "Product updated successfully",
          [
            {
              text: "OK",
              onPress: () => {
                refreshData()
              }
            }
          ]
        )
      } else {
        const errorMessage = result?.error || result?.message || "Failed to update product. Please try again."
        Alert.alert("Error", errorMessage)
      }
    } catch (error) {
      console.error("Update product error:", error)
      let errorMessage = "Failed to update product. Please try again."
      
      if (error.message) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
      Alert.alert("Error", errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = async (product) => {
    Alert.alert(
      "Delete Product",
      `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await deleteProduct(product.id || product._id)
              
              if (result && result.success !== false) {
                Alert.alert(
                  "Success", 
                  "Product deleted successfully",
                  [
                    {
                      text: "OK",
                      onPress: () => {
                        refreshData()
                      }
                    }
                  ]
                )
              } else {
                const errorMessage = result?.error || result?.message || "Failed to delete product. Please try again."
                Alert.alert("Error", errorMessage)
              }
            } catch (error) {
              console.error("Delete product error:", error)
              let errorMessage = "Failed to delete product. Please try again."
              
              if (error.message) {
                errorMessage = error.message
              } else if (typeof error === 'string') {
                errorMessage = error
              }
              
              Alert.alert("Error", errorMessage)
            }
          }
        }
      ]
    )
  }

  const handleAssignProduct = async (product, deliveryManId) => {
    try {
      const success = await assignProductToDeliveryMan(deliveryManId, product)
      if (success) {
        Alert.alert("Success", `${product.name} assigned successfully`)
      } else {
        Alert.alert("Error", "Failed to assign product. Please try again.")
      }
    } catch (error) {
      console.error("Assign product error:", error)
      Alert.alert("Error", "Failed to assign product. Please try again.")
    }
  }

  const productsArray = Array.isArray(products) ? products : (products || [])

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Products ({productsArray.length})</Text>
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={openModal}
          >
            <Text style={styles.addButtonText}>+ Add Product</Text>
          </TouchableOpacity>
        </View>

        {/* Existing Products */}
        <View style={styles.productsSection}>          
          {productsArray.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No products found</Text>
              <Text style={styles.emptySubText}>Add your first product using the button above</Text>
            </View>
          ) : (
            productsArray.map((product) => (
              <View key={product.id || product._id} style={styles.productCard}>
                <View style={styles.productHeader}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <View style={styles.productActions}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => openEditModal(product)}
                    >
                      <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteProduct(product)}
                    >
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                <Text style={styles.productInfo}>
                  Price: ₹{product.price || 0} | Min: ₹{product.minPrice || 0} | Stock: {product.quantity || product.stock || 0}
                </Text>
                {product.type && <Text style={styles.productType}>Type: {product.type}</Text>}

                {/* {deliveryMen && deliveryMen.length > 0 && (
                  <>
                    <Text style={styles.assignLabel}>Assign to:</Text>
                    <View style={styles.assignButtons}>
                      {deliveryMen.map((deliveryMan) => (
                        <TouchableOpacity
                          key={deliveryMan.id}
                          style={styles.assignButton}
                          onPress={() => handleAssignProduct(product, deliveryMan.id)}
                        >
                          <Text style={styles.assignButtonText}>{deliveryMan.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )} */}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Add/Edit Product Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoidingView}
          >
            <View style={styles.modalContent}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editMode ? "Edit Product" : "Add New Product"}
                </Text>
              </View>

              {/* Modal Body */}
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Product Name *</Text>
                  <TextInput
                    style={[
                      styles.input, 
                      errors.productName ? styles.inputError : null
                    ]}
                    value={productName}
                    onChangeText={(value) => handleFieldChange('productName', value)}
                    placeholder="Enter product name"
                    editable={!loading}
                  />
                  {errors.productName ? (
                    <Text style={styles.errorText}>{errors.productName}</Text>
                  ) : null}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Price (₹) *</Text>
                  <TextInput
                    style={[
                      styles.input, 
                      errors.price ? styles.inputError : null
                    ]}
                    value={price}
                    onChangeText={(value) => handleFieldChange('price', value)}
                    placeholder="Enter price"
                    keyboardType="numeric"
                    editable={!loading}
                  />
                  {errors.price ? (
                    <Text style={styles.errorText}>{errors.price}</Text>
                  ) : null}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Min Price (₹) *</Text>
                  <TextInput
                    style={[
                      styles.input, 
                      errors.minPrice ? styles.inputError : null
                    ]}
                    value={minPrice}
                    onChangeText={(value) => handleFieldChange('minPrice', value)}
                    placeholder="Enter minimum price"
                    keyboardType="numeric"
                    editable={!loading}
                  />
                  {errors.minPrice ? (
                    <Text style={styles.errorText}>{errors.minPrice}</Text>
                  ) : null}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Stock *</Text>
                  <TextInput
                    style={[
                      styles.input, 
                      errors.stock ? styles.inputError : null
                    ]}
                    value={stock}
                    onChangeText={(value) => handleFieldChange('stock', value)}
                    placeholder="Enter stock quantity"
                    keyboardType="numeric"
                    editable={!loading}
                  />
                  {errors.stock ? (
                    <Text style={styles.errorText}>{errors.stock}</Text>
                  ) : null}
                </View>
              </ScrollView>

              {/* Modal Footer */}
              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  style={[styles.cancelButton, loading && styles.buttonDisabled]}
                  onPress={closeModal}
                  disabled={loading}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.submitButton, loading && styles.buttonDisabled]} 
                  onPress={editMode ? handleUpdateProduct : handleAddProduct}
                  disabled={loading}
                >
                  <Text style={styles.submitButtonText}>
                    {loading ? (editMode ? "Updating..." : "Adding...") : (editMode ? "Update Product" : "Add Product")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    flex: 1,
  },
  titleSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
  },
  addButton: {
    backgroundColor: "#10B981",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  productsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  emptyContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 40,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
    marginBottom: 4,
  },
  emptySubText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  productCard: {
    backgroundColor: "#FFFFFF",
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  productName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
    marginRight: 12,
  },
  productActions: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
  deleteButton: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
  productInfo: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  productType: {
    fontSize: 12,
    color: "#8B5CF6",
    fontWeight: "500",
    marginBottom: 16,
  },
  assignLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 12,
  },
  assignButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  assignButton: {
    backgroundColor: "#5563EB",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  assignButtonText: {
    color: "#FFFFFF",
    fontWeight: "500",
    fontSize: 14,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  keyboardAvoidingView: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    width: screenWidth * 0.9,
    maxHeight: screenHeight * 0.8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
  },
  modalBody: {
    padding: 20,
    maxHeight: screenHeight * 0.5,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#F9FAFB",
  },
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 4,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
  },
  submitButton: {
    flex: 1,
    backgroundColor: "#10B981",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
})

export default AddProduct