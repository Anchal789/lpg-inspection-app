"use client"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { LineChart } from "react-native-chart-kit"
import { useData } from "../../context/DataContext"
import { useAuth } from "../../context/AuthContext"

const screenWidth = Dimensions.get("window").width

const DeliveryDashboard = () => {
  const navigation = useNavigation()
  const { inspections } = useData()
  const { user, logout } = useAuth()

  const myInspections = inspections.filter((inspection) => inspection.deliveryManId === user?.id)
  const today = new Date().toDateString()
  const todayInspections = myInspections.filter(
    (inspection) => new Date(inspection.date).toDateString() === today,
  ).length

  const totalSales = myInspections.reduce((sum, inspection) => sum + inspection.totalAmount, 0)

  // Mock chart data for daily and monthly inspections
  const dailyChartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: [3, 5, 2, 8, 6, 4, 7],
        strokeWidth: 2,
      },
    ],
  }

  const monthlyChartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        data: [45, 52, 38, 67, 59, 48],
        strokeWidth: 2,
      },
    ],
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome,</Text>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.dateText}>{new Date().toLocaleDateString()}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{myInspections.length}</Text>
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

      {/* New Inspection Button */}
      <TouchableOpacity
        style={styles.newInspectionButton}
        onPress={() => navigation.navigate("NewInspection" as never)}
      >
        <Text style={styles.newInspectionIcon}>📋</Text>
        <Text style={styles.newInspectionText}>Start New Inspection</Text>
      </TouchableOpacity>

      {/* Daily Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Daily Inspections (This Week)</Text>
        <LineChart
          data={dailyChartData}
          width={screenWidth - 40}
          height={200}
          chartConfig={{
            backgroundColor: "#ffffff",
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: "5",
              strokeWidth: "2",
              stroke: "#10B981",
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>

      {/* Monthly Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Monthly Inspections</Text>
        <LineChart
          data={monthlyChartData}
          width={screenWidth - 40}
          height={200}
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
              r: "5",
              strokeWidth: "2",
              stroke: "#2563EB",
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("DeliveryHistory" as never)}>
          <Text style={styles.actionIcon}>📊</Text>
          <Text style={styles.actionText}>View History</Text>
        </TouchableOpacity>
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
    backgroundColor: "#FFFFFF",
    padding: 20,
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
  dateText: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "500",
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
    padding: 20,
    gap: 12,
  },
  statCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    flex: 1,
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
    color: "#10B981",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  newInspectionButton: {
    backgroundColor: "#10B981",
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 20,
  },
  newInspectionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  newInspectionText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  chartContainer: {
    backgroundColor: "#FFFFFF",
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
  },
  quickActions: {
    padding: 20,
    paddingTop: 0,
  },
  actionButton: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  actionText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
})

export default DeliveryDashboard
