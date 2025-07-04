import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useData } from "../../context/DataContext"

const AssignStock = () => {
  const navigation = useNavigation()
  const { deliveryMen } = useData()

  const renderDeliveryMan = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.deliveryManCard}
      onPress={() => navigation.navigate("AssignProduct" as never, { deliveryMan: item } as never)}
    >
      <View style={styles.deliveryManInfo}>
        <Text style={styles.deliveryManName}>{item.name}</Text>
        <Text style={styles.deliveryManPhone}>{item.phone}</Text>
        <Text style={styles.assignedProducts}>Assigned Products: {item.assignedProducts.length}</Text>
      </View>
      <View style={styles.arrowIcon}>
        <Text style={styles.arrowText}>→</Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Delivery Man</Text>
      <Text style={styles.subtitle}>Choose a delivery man to assign products</Text>

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
    paddingBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  listContainer: {
    padding: 20,
    paddingTop: 0,
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
  deliveryManPhone: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  assignedProducts: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "500",
  },
  arrowIcon: {
    backgroundColor: "#2563EB",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  arrowText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
})

export default AssignStock
