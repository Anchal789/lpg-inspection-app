"use client"

import { useState } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from "react-native"
import { useRoute } from "@react-navigation/native"
import { useData } from "../../context/DataContext"

const AssignProductScreen = () => {
  const route = useRoute()
  const deliveryMan = (route.params as any)?.deliveryMan
  const { products, assignProductToDeliveryMan } = useData()

  const [productAssignments, setProductAssignments] = useState<
    Record<
      string,
      {
        quantity: string
        price: string
        minPrice: string
      }
    >
  >({})

  const updateAssignment = (productId: string, field: string, value: string) => {
    setProductAssignments((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }))
  }

  const assignProduct = (product: any) => {
    const assignment = productAssignments[product.id]
    if (!assignment?.quantity || !assignment?.price || !assignment?.minPrice) {
      Alert.alert("Error", "Please fill all fields for this product")
      return
    }

    const assignedProduct = {
      ...product,
      quantity: Number.parseInt(assignment.quantity),
      price: Number.parseFloat(assignment.price),
      minPrice: Number.parseFloat(assignment.minPrice),
    }

    assignProductToDeliveryMan(deliveryMan.id, assignedProduct)
    Alert.alert("Success", `${product.name} assigned to ${deliveryMan.name}`)

    // Clear the assignment
    setProductAssignments((prev) => {
      const newState = { ...prev }
      delete newState[product.id]
      return newState
    })
  }

  const renderProduct = ({ item }: { item: any }) => {
    const assignment = productAssignments[item.id] || {}

    return (
      <View style={styles.productCard}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productStock}>Available Stock: {item.quantity}</Text>

        <View style={styles.inputContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Quantity</Text>
            <TextInput
              style={styles.input}
              value={assignment.quantity || ""}
              onChangeText={(value) => updateAssignment(item.id, "quantity", value)}
              placeholder="0"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Price (₹)</Text>
            <TextInput
              style={styles.input}
              value={assignment.price || ""}
              onChangeText={(value) => updateAssignment(item.id, "price", value)}
              placeholder="0.00"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Min Price (₹)</Text>
            <TextInput
              style={styles.input}
              value={assignment.minPrice || ""}
              onChangeText={(value) => updateAssignment(item.id, "minPrice", value)}
              placeholder="0.00"
              keyboardType="numeric"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.assignButton} onPress={() => assignProduct(item)}>
          <Text style={styles.assignButtonText}>Assign</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Assign Products</Text>
        <Text style={styles.subtitle}>Assigning to: {deliveryMan.name}</Text>
      </View>

      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
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
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
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
  productName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  productStock: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: "#F9FAFB",
  },
  assignButton: {
    backgroundColor: "#10B981",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  assignButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
})

export default AssignProductScreen
