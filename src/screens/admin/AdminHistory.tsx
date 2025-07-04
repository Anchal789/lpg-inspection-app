import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useData } from "../../context/DataContext"

const AdminHistory = () => {
  const navigation = useNavigation()
  const { deliveryMen, inspections } = useData()

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`)
  }

  const renderDeliveryMan = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.deliveryManCard}
      onPress={() => navigation.navigate("DeliveryManDetails" as never, { deliveryMan: item } as never)}
    >
      <View style={styles.deliveryManInfo}>
        <Text style={styles.deliveryManName}>{item.name}</Text>
        <Text style={styles.deliveryManStats}>
          Inspections: {item.totalInspections} | Sales: ₹{item.totalSales.toLocaleString()}
        </Text>
        <Text style={styles.deliveryManPhone}>{item.phone}</Text>
      </View>
      <TouchableOpacity style={styles.callButton} onPress={() => handleCall(item.phone)}>
        <Text style={styles.callButtonText}>📞</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Delivery Men Performance</Text>
      <FlatList
        data={deliveryMen}
        renderItem={renderDeliveryMan}
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
})

export default AdminHistory
