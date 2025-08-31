"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking, Alert } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useData } from "../../context/DataContext"
import { useAuth } from "../../context/AuthContext"
import ApiService from "../../api/api-service"
import { Ionicons } from "@expo/vector-icons"

const AdminHistory = () => {
  const navigation = useNavigation()
  const { deliveryMen, inspections, refreshData } = useData()
  const { token } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      await refreshData()
    } catch (error) {
      console.error("Error fetching data:", error)
      Alert.alert("Error", "Failed to load data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`)
  }

  const renderDeliveryMan = ({ item }: { item: any }) => {
    // Calculate stats for this delivery man
    const deliveryManInspections = inspections.filter(inspection => inspection.deliveryManId === item.id)
    const totalInspections = deliveryManInspections.length
    const totalSales = deliveryManInspections.reduce((sum, inspection) => sum + inspection.totalAmount, 0)

    return (
      <TouchableOpacity
        style={styles.deliveryManCard}
        onPress={() => navigation.navigate("DeliveryManDetails" as never, { deliveryMan: { ...item, totalInspections, totalSales } } as never)}
      >
        <View style={styles.deliveryManInfo}>
          <Text style={styles.deliveryManName}>{item.name}</Text>
          <Text style={styles.deliveryManStats}>
            Inspections: {totalInspections} | Sales: ₹{totalSales.toLocaleString()}
          </Text>
          <Text style={styles.deliveryManPhone}>{item.phone}</Text>
        </View>
        <TouchableOpacity style={styles.callButton} onPress={() => handleCall(item.phone)}>
          <Text style={styles.callButtonText}>📞</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    )
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    )
  }

  // Extract the actual array from the deliveryMen object
  const deliveryMenArray = Array.isArray(deliveryMen) ? deliveryMen : (deliveryMen || [])
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Delivery Men Performance</Text>
      <FlatList
        data={deliveryMenArray}
        renderItem={renderDeliveryMan}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={fetchData}
        ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No delivery men found</Text>
              <Text style={styles.emptySubtext}>Add delivery men to start assigning products</Text>
            </View>
          }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    padding: 20,
    paddingBottom: 10,
  },
  listContainer: {
    padding: 20,
    paddingTop: 10,
  },
  deliveryManCard: {
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
  deliveryManInfo: {
    flex: 1,
  },
  deliveryManName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  deliveryManStats: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  deliveryManPhone: {
    fontSize: 14,
    color: "#2563EB",
    fontWeight: "500",
  },
  callButton: {
    backgroundColor: "#10B981",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  callButtonText: {
    fontSize: 20,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#6B7280",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 8,
    textAlign: "center",
  },
})

export default AdminHistory