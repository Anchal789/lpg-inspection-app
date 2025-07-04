"use client"

import { useState } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from "react-native"
import { useRoute, useNavigation } from "@react-navigation/native"
import { useData } from "../../context/DataContext"

const DeliveryManDetails = () => {
  const route = useRoute()
  const navigation = useNavigation()
  const { getInspectionsByDeliveryMan } = useData()
  const deliveryMan = (route.params as any)?.deliveryMan

  const [nameFilter, setNameFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("")

  const inspections = getInspectionsByDeliveryMan(deliveryMan.id)

  const filteredInspections = inspections.filter((inspection) => {
    const nameMatch = inspection.consumerName.toLowerCase().includes(nameFilter.toLowerCase())
    const dateMatch = dateFilter ? inspection.date.includes(dateFilter) : true
    return nameMatch && dateMatch
  })

  const renderInspection = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.inspectionCard}
      onPress={() => navigation.navigate("InspectionDetails" as never, { inspection: item } as never)}
    >
      <View style={styles.inspectionInfo}>
        <Text style={styles.consumerName}>{item.consumerName}</Text>
        <Text style={styles.consumerNumber}>Consumer: {item.consumerNumber}</Text>
        <Text style={styles.inspectionDate}>
          {new Date(item.date).toLocaleDateString()} at {new Date(item.date).toLocaleTimeString()}
        </Text>
        <Text style={styles.inspectionAmount}>Amount: ₹{item.totalAmount}</Text>
      </View>
      <View style={styles.detailButton}>
        <Text style={styles.detailButtonText}>👁️</Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      {/* Delivery Man Info */}
      <View style={styles.header}>
        <Text style={styles.deliveryManName}>{deliveryMan.name}</Text>
        <Text style={styles.deliveryManStats}>
          Total Inspections: {deliveryMan.totalInspections} | Total Sales: ₹{deliveryMan.totalSales.toLocaleString()}
        </Text>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <TextInput
          style={styles.filterInput}
          placeholder="Filter by consumer name"
          value={nameFilter}
          onChangeText={setNameFilter}
        />
        <TextInput
          style={styles.filterInput}
          placeholder="Filter by date (YYYY-MM-DD)"
          value={dateFilter}
          onChangeText={setDateFilter}
        />
      </View>

      {/* Inspections List */}
      <FlatList
        data={filteredInspections}
        renderItem={renderInspection}
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
  deliveryManName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  deliveryManStats: {
    fontSize: 14,
    color: "#6B7280",
  },
  filtersContainer: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  filterInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: "#F9FAFB",
    marginBottom: 8,
  },
  listContainer: {
    padding: 16,
  },
  inspectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inspectionInfo: {
    flex: 1,
  },
  consumerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  consumerNumber: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 2,
  },
  inspectionDate: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  inspectionAmount: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "500",
  },
  detailButton: {
    backgroundColor: "#2563EB",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  detailButtonText: {
    fontSize: 16,
  },
})

export default DeliveryManDetails
