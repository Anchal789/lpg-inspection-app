"use client"

import { useState } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert } from "react-native"
import { useData } from "../../context/DataContext"

const AddProduct = () => {
  const { products, deliveryMen, addProduct, assignProductToDeliveryMan } = useData()
  const [showAddModal, setShowAddModal] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    quantity: "",
    minPrice: "",
  })

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.quantity || !newProduct.minPrice) {
      Alert.alert("Error", "Please fill all fields")
      return
    }

    const product = {
      id: Date.now().toString(),
      name: newProduct.name,
      price: Number.parseFloat(newProduct.price),
      quantity: Number.parseInt(newProduct.quantity),
      minPrice: Number.parseFloat(newProduct.minPrice),
    }

    addProduct(product)
    setNewProduct({ name: "", price: "", quantity: "", minPrice: "" })
    setShowAddModal(false)
    Alert.alert("Success", "Product added successfully!")
  }

  const assignToDeliveryMan = (product: any, deliveryManId: string) => {
    assignProductToDeliveryMan(deliveryManId, product)
    Alert.alert("Success", "Product assigned successfully!")
  }

  const renderProduct = ({ item }: { item: any }) => (
    <View style={styles.productCard}>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productDetails}>
          Price: ₹{item.price} | Min: ₹{item.minPrice} | Stock: {item.quantity}
        </Text>
      </View>

      <Text style={styles.assignTitle}>Assign to:</Text>
      <View style={styles.deliveryMenContainer}>
        {deliveryMen.map((dm) => (
          <TouchableOpacity key={dm.id} style={styles.assignButton} onPress={() => assignToDeliveryMan(item, dm.id)}>
            <Text style={styles.assignButtonText}>{dm.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Products Management</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Text style={styles.addButtonText}>+ Add Product</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Add Product Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Product</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Product Name</Text>
              <TextInput
                style={styles.input}
                value={newProduct.name}
                onChangeText={(text) => setNewProduct({ ...newProduct, name: text })}
                placeholder="Enter product name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Price (₹)</Text>
              <TextInput
                style={styles.input}
                value={newProduct.price}
                onChangeText={(text) => setNewProduct({ ...newProduct, price: text })}
                placeholder="0.00"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Quantity</Text>
              <TextInput
                style={styles.input}
                value={newProduct.quantity}
                onChangeText={(text) => setNewProduct({ ...newProduct, quantity: text })}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Minimum Selling Price (₹)</Text>
              <TextInput
                style={styles.input}
                value={newProduct.minPrice}
                onChangeText={(text) => setNewProduct({ ...newProduct, minPrice: text })}
                placeholder="0.00"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleAddProduct}>
                <Text style={styles.saveButtonText}>Add Product</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  addButton: {
    backgroundColor: "#10B981",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  listContainer: {
    padding: 16,
  },
  productCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productInfo: {
    marginBottom: 12,
  },
  productName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  productDetails: {
    fontSize: 14,
    color: "#6B7280",
  },
  assignTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  deliveryMenContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  assignButton: {
    backgroundColor: "#2563EB",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  assignButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
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
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
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
})

export default AddProduct
