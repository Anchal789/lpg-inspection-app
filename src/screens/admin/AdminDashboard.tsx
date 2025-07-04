"use client"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { LineChart } from "react-native-chart-kit"
import { useData } from "../../context/DataContext"
import { useAuth } from "../../context/AuthContext"

const screenWidth = Dimensions.get("window").width

const AdminDashboard = () => {
  const navigation = useNavigation()
  const { inspections, deliveryMen } = useData()
  const { user, logout } = useAuth()

  const today = new Date().toDateString()
  const todayInspections = inspections.filter((inspection) => new Date(inspection.date).toDateString() === today).length

  const totalSales = inspections.reduce((sum, inspection) => sum + inspection.totalAmount, 0)

  // Mock chart data
  const chartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: [12, 19, 15, 25, 22, 18, 24],
        strokeWidth: 2,
      },
    ],
  }

  const menuItems = [
    { title: "History", icon: "📊", screen: "AdminHistory", color: "#3B82F6" },
    { title: "Assign Stock", icon: "📦", screen: "AssignStock", color: "#10B981" },
    { title: "Add Product", icon: "➕", screen: "AddProduct", color: "#F59E0B" },
    { title: "Search Inspection", icon: "🔍", screen: "SearchInspection", color: "#8B5CF6" },
  ]

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{deliveryMen.length}</Text>
          <Text style={styles.statLabel}>Delivery Men</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{inspections.length}</Text>
          <Text style={styles.statLabel}>Total Inspections</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{todayInspections}</Text>
          <Text style={styles.statLabel}>Today's Inspections</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>₹{totalSales.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Total Sales</Text>
        </View>
      </View>

      {/* Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Weekly Inspections</Text>
        <LineChart
          data={chartData}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            backgroundColor: "#ffffff",
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: "#2563EB",
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>

      {/* Menu Grid */}
      <View style={styles.menuContainer}>
        <Text style={styles.menuTitle}>Quick Actions</Text>
        <View style={styles.menuGrid}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, { backgroundColor: item.color }]}
              onPress={() => navigation.navigate(item.screen as never)}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
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
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  welcomeText: {
    fontSize: 16,
    color: "#6B7280",
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
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
    color: "#2563EB",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  chartContainer: {
    backgroundColor: "#FFFFFF",
    margin: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
  },
  menuContainer: {
    padding: 20,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  menuItem: {
    flex: 1,
    minWidth: "45%",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  menuText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
})

export default AdminDashboard
