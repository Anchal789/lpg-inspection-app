"use client"

import { useState } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useData } from "../../context/DataContext"
import { useAuth } from "../../context/AuthContext"

const DeliveryHistory = () => {
  const navigation = useNavigation()
  const { inspections } = useData()
  const { user } = useAuth()
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    consumerName: "",
    date: "",
  })

  const myInspections = inspections.filter((inspection) => inspection.deliveryManId === user?.id)

  const filteredInspections = myInspections.filter((inspection) => {
    const nameMatch =
      !filters.consumerName || inspection.consumerName.toLowerCase().includes(filters.consumerName.toLowerCase())
    const dateMatch = !filters.date || inspection.date.includes(filters.date)

    return nameMatch && dateMatch
  })

  const clearFilters = () => {
    setFilters({
      consumerName: "",
      date: "",
    })
  }

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
      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>✓</Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      {/* Header with Filter Button */}
      <View style={styles.header}>
        <Text style={styles.title}>My Inspections ({filteredInspections.length})</Text>
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(true)}>
          <Text style={styles.filterButtonText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Active Filters Display */}
      {(filters.consumerName || filters.date) && (
        <View style={styles.activeFilters}>
          <Text style={styles.activeFiltersText}>Filters Active</Text>
          <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
            <Text style={styles.clearFiltersText}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Inspections List */}
      <FlatList
        data={filteredInspections}
        renderItem={renderInspection}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No inspections found</Text>
          </View>
        }
      />

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Inspections</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Consumer Name</Text>
              <TextInput
                style={styles.input}
                value={filters.consumerName}
                onChangeText={(text) => setFilters({ ...filters, consumerName: text })}
                placeholder="Enter consumer name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                value={filters.date}
                onChangeText={(text) => setFilters({ ...filters, date: text })}
                placeholder="2024-01-15"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowFilters(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={() => setShowFilters(false)}>
                <Text style={styles.applyButtonText}>Apply</Text>
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  filterButton: {
    backgroundColor: "#2563EB",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  filterButtonText: {
    fontSize: 16,
  },
  activeFilters: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F59E0B",
  },
  activeFiltersText: {
    fontSize: 12,
    color: "#92400E",
    fontWeight: "500",
  },
  clearFiltersButton: {
    backgroundColor: "#F59E0B",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearFiltersText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "500",
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
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  inspectionDate: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 4,
  },
  inspectionAmount: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "500",
  },
  statusBadge: {
    backgroundColor: "#10B981",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
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
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
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
  applyButton: {
    flex: 1,
    backgroundColor: "#2563EB",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
})

export default DeliveryHistory
