"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Alert } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useAuth } from "../../context/AuthContext"
import ApiService from "../../api/api-service"

const SuperAdminDashboard = () => {
  const navigation = useNavigation()
  const { user, logout } = useAuth()
  const [stats, setStats] = useState(null)
  const [pendingRequests, setPendingRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [statsResponse, requestsResponse] = await Promise.all([
        ApiService.getSuperAdminStats(),
        ApiService.getPendingRequests(),
      ])

      if (statsResponse.success) {
        setStats(statsResponse.data)
      }

      if (requestsResponse.success) {
        setPendingRequests(requestsResponse.data)
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error)
      Alert.alert(
        "Error",
        "Failed to load dashboard data. Please contact developer:\nEmail: anchaldesh7@gmail.com\nPhone: +91 7747865603",
      )
    } finally {
      setLoading(false)
    }
  }

  const handleApproveRequest = async (requestId: string) => {
    try {
      const response = await ApiService.approveDistributor(requestId)
      if (response.success) {
        Alert.alert("Success", "Distributor approved successfully!")
        fetchDashboardData() // Refresh data
      } else {
        Alert.alert("Error", response.error || "Failed to approve distributor")
      }
    } catch (error) {
      console.error("Approve error:", error)
      Alert.alert("Error", "Failed to approve distributor")
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    Alert.alert("Reject Request", "Are you sure you want to reject this distributor request?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reject",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await ApiService.rejectDistributor(requestId, "Rejected by super admin")
            if (response.success) {
              Alert.alert("Success", "Distributor request rejected")
              fetchDashboardData() // Refresh data
            } else {
              Alert.alert("Error", response.error || "Failed to reject distributor")
            }
          } catch (error) {
            console.error("Reject error:", error)
            Alert.alert("Error", "Failed to reject distributor")
          }
        },
      },
    ])
  }

  const renderPendingRequest = ({ item }: { item: any }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <Text style={styles.agencyName}>{item.agencyName}</Text>
        <Text style={styles.sapCode}>SAP: {item.sapCode}</Text>
      </View>

      <View style={styles.requestDetails}>
        <Text style={styles.adminName}>Admin: {item.adminName}</Text>
        <Text style={styles.requestDate}>Requested: {new Date(item.requestedAt).toLocaleDateString()}</Text>
        {item.deliveryMen && item.deliveryMen.length > 0 && (
          <Text style={styles.deliveryMenCount}>Delivery Men: {item.deliveryMen.length}</Text>
        )}
      </View>

      <View style={styles.requestActions}>
        <TouchableOpacity style={styles.rejectButton} onPress={() => handleRejectRequest(item._id)}>
          <Text style={styles.rejectButtonText}>Reject</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.approveButton} onPress={() => handleApproveRequest(item._id)}>
          <Text style={styles.approveButtonText}>Approve</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Super Admin</Text>
          <Text style={styles.userName}>{user?.name}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalDistributors}</Text>
            <Text style={styles.statLabel}>Distributors</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalDeliveryMen}</Text>
            <Text style={styles.statLabel}>Delivery Men</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalInspections}</Text>
            <Text style={styles.statLabel}>Total Inspections</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.pendingRequests}</Text>
            <Text style={styles.statLabel}>Pending Requests</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.todayInspections}</Text>
            <Text style={styles.statLabel}>Today's Inspections</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>₹{stats.totalSales?.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Sales</Text>
          </View>
        </View>
      )}

      {/* Pending Requests */}
      <View style={styles.requestsSection}>
        <Text style={styles.sectionTitle}>Pending Distributor Requests ({pendingRequests.length})</Text>

        {pendingRequests.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No pending requests</Text>
          </View>
        ) : (
          <FlatList
            data={pendingRequests}
            renderItem={renderPendingRequest}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </ScrollView>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#7C3AED",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  welcomeText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  logoutButton: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 20,
    gap: 12,
  },
  statCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    flex: 1,
    minWidth: "45%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#7C3AED",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  requestsSection: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  requestCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  agencyName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
  },
  sapCode: {
    fontSize: 14,
    color: "#7C3AED",
    fontWeight: "500",
  },
  requestDetails: {
    marginBottom: 16,
  },
  adminName: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
  },
  requestDate: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  deliveryMenCount: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "500",
  },
  requestActions: {
    flexDirection: "row",
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: "#EF4444",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  rejectButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  approveButton: {
    flex: 1,
    backgroundColor: "#10B981",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  approveButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyState: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
  },
})

export default SuperAdminDashboard
