import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking } from "react-native"
import { useRoute } from "@react-navigation/native"

const inspectionQuestions = [
  "Is Customer aware about 1906?",
  "Is cylinder in upright position?",
  "Is Hot Plate on a platform as compared with cylinder?",
  "Is there any crack on the connected Suraksha Hose?",
  "Is Suraksha Hose changed during inspection?",
  "Is customer using any other flame device or fuel or SKO in same kitchen?",
  "Is the DPR in use of same OMC as cylinder?",
  "Is the safety inspection has done?",
  "Is the customer wants to do servicing of the Hot Plate?",
  "Is hot plate with BSI mark?",
  "Does consumer wish to upgrade with Hi-star hotplate?",
  "Does consumer wish for portable kitchen platform?",
]

const InspectionDetails = () => {
  const route = useRoute()
  const inspection = (route.params as any)?.inspection

  const openMaps = () => {
    const { latitude, longitude } = inspection.location
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`
    Linking.openURL(url)
  }

  return (
    <ScrollView style={styles.container}>
      {/* Consumer Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Consumer Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{inspection.consumerName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Consumer Number:</Text>
          <Text style={styles.value}>{inspection.consumerNumber}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Mobile:</Text>
          <Text style={styles.value}>{inspection.mobileNumber}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Address:</Text>
          <Text style={styles.value}>{inspection.address}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Date & Time:</Text>
          <Text style={styles.value}>
            {new Date(inspection.date).toLocaleDateString()} at {new Date(inspection.date).toLocaleTimeString()}
          </Text>
        </View>
        <TouchableOpacity style={styles.locationButton} onPress={openMaps}>
          <Text style={styles.locationButtonText}>📍 View Location</Text>
        </TouchableOpacity>
      </View>

      {/* Safety Questions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Safety Inspection Results</Text>
        {inspectionQuestions.map((question, index) => (
          <View key={index} style={styles.questionRow}>
            <Text style={styles.questionText}>
              {index + 1}. {question}
            </Text>
            <View
              style={[
                styles.answerBadge,
                { backgroundColor: inspection.answers[index] === "yes" ? "#10B981" : "#EF4444" },
              ]}
            >
              <Text style={styles.answerText}>{inspection.answers[index] === "yes" ? "YES" : "NO"}</Text>
            </View>
            {/* Show due date for Suraksha Hose question */}
            {index === 4 && inspection.answers[index] === "yes" && inspection.surakshaHoseDueDate && (
              <Text style={styles.dueDateText}>Due Date: {inspection.surakshaHoseDueDate}</Text>
            )}
          </View>
        ))}
      </View>

      {/* Products */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Products Sold</Text>
        {inspection.products.map((product: any, index: number) => (
          <View key={index} style={styles.productRow}>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productDetails}>
                Qty: {product.quantity} × ₹{product.price} = ₹{product.quantity * product.price}
              </Text>
            </View>
          </View>
        ))}

        {/* Discount breakdown */}
        <View style={styles.discountBreakdown}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>
              ₹{inspection.products.reduce((sum: number, product: any) => sum + product.quantity * product.price, 0)}
            </Text>
          </View>

          {(inspection.hotplateExchange || inspection.otherDiscount > 0) && (
            <>
              {inspection.hotplateExchange && (
                <View style={styles.totalRow}>
                  <Text style={styles.discountLabel}>Hot Plate Exchange:</Text>
                  <Text style={styles.discountValue}>-₹450</Text>
                </View>
              )}
              {inspection.otherDiscount > 0 && (
                <View style={styles.totalRow}>
                  <Text style={styles.discountLabel}>Other Discount:</Text>
                  <Text style={styles.discountValue}>-₹{inspection.otherDiscount}</Text>
                </View>
              )}
              <View style={styles.totalRow}>
                <Text style={styles.discountLabel}>Total Discount:</Text>
                <Text style={styles.discountValue}>
                  -₹{(inspection.hotplateExchange ? 450 : 0) + (inspection.otherDiscount || 0)}
                </Text>
              </View>
            </>
          )}

          <View style={[styles.totalRow, styles.finalTotalRow]}>
            <Text style={styles.finalTotalText}>Final Amount: ₹{inspection.totalAmount}</Text>
          </View>
        </View>
      </View>

      {/* Images */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kitchen Images</Text>
        <View style={styles.imagesContainer}>
          {inspection.images.map((image: string, index: number) => (
            <Image
              key={index}
              source={{ uri: image || "/placeholder.svg?height=150&width=150" }}
              style={styles.image}
            />
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
  section: {
    backgroundColor: "#FFFFFF",
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    width: 120,
  },
  value: {
    fontSize: 14,
    color: "#1F2937",
    flex: 1,
  },
  locationButton: {
    backgroundColor: "#2563EB",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    marginTop: 12,
  },
  locationButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  questionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  questionText: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
    marginRight: 12,
  },
  answerBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  answerText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
  },
  productDetails: {
    fontSize: 14,
    color: "#6B7280",
  },
  totalRow: {
    paddingTop: 12,
    alignItems: "flex-end",
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#10B981",
  },
  imagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  dueDateText: {
    fontSize: 12,
    color: "#F59E0B",
    fontWeight: "500",
    marginTop: 4,
    fontStyle: "italic",
  },
  discountBreakdown: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 14,
    color: "#374151",
  },
  totalValue: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  discountLabel: {
    fontSize: 14,
    color: "#EF4444",
  },
  discountValue: {
    fontSize: 14,
    color: "#EF4444",
    fontWeight: "500",
  },
  finalTotalRow: {
    borderTopWidth: 1,
    borderTopColor: "#D1D5DB",
    paddingTop: 8,
    marginTop: 8,
  },
  finalTotalText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#10B981",
  },
})

export default InspectionDetails
