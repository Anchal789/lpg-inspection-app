import { Platform, Linking, Alert } from "react-native";
import ApiService from "../api/api-service";

type AnyRecord = Record<string, any>

// Helper functions for CSV formatting
function csvEscape(value: any): string {
  if (value === null || value === undefined) return ""
  const str = typeof value === "object" ? JSON.stringify(value) : String(value)
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function formatDateISO(d?: string | Date): string {
  if (!d) return ""
  const date = typeof d === "string" ? new Date(d) : d
  if (isNaN(date.getTime())) return ""
  return date.toISOString().slice(0, 19).replace("T", " ")
}

function flattenInspection(row: AnyRecord, deliveryMenMap: Record<string, string>): AnyRecord {
  const consumer = row.consumer || {}
  const deliveryName = row.deliveryManName || row?.deliveryManId?.name || deliveryMenMap[row.deliveryManId] || ""

  const safetyQuestions: Array<{ questionId: number; answer: string }> = row.safetyQuestions || []
  const safetyCols: AnyRecord = {}
  safetyQuestions.forEach((q) => {
    const key = `Q${Number(q.questionId ?? 0) + 1}`
    safetyCols[key] = q.answer ?? ""
  })

  const productsArr = row.products || []
  const productsSummary = productsArr
    .map((p: AnyRecord) => {
      const name = p.name || p?.productId?.name || "Item"
      const qty = p.quantity ?? 1
      const price = p.price ?? ""
      return `${name} x ${qty}${price !== "" ? ` @ ${price}` : ""}`
    })
    .join(" | ")

  const imagesCount = Array.isArray(row.images) ? row.images.length : 0

  return {
    InspectionID: row.inspectionId || row.id || row._id || "",
    Date: formatDateISO(row.inspectionDate || row.date),
    Distributor: row?.distributorId?.agencyName || "",
    DeliveryMan: deliveryName,
    ConsumerName: row.consumerName || consumer.name || "",
    ConsumerNumber: row.consumerNumber || consumer.consumerNumber || "",
    Mobile: row.mobileNumber || consumer.mobileNumber || "",
    Address: row.address || consumer.address || "",
    SurakshaHoseDueDate: row.surakshaHoseDueDate || "",
    HotplateExchange: row.hotplateExchange ? "Yes" : "No",
    OtherDiscount: row.otherDiscount ?? "",
    SubtotalAmount: row.subtotalAmount ?? "",
    TotalDiscount: row.totalDiscount ?? "",
    TotalAmount: row.totalAmount ?? "",
    PassedQuestions: row.passedQuestions ?? "",
    FailedQuestions: row.failedQuestions ?? "",
    Images: row?.images?.[0]?.imageUrl,
    Products: productsSummary,
    Latitude: row.location?.latitude ?? "",
    Longitude: row.location?.longitude ?? "",
    ...safetyCols,
  }
}

function buildCSV(rows: AnyRecord[]): string {
  if (!rows.length) return ""
  const allHeaders = new Set<string>()
  rows.forEach((r) => Object.keys(r).forEach((k) => allHeaders.add(k)))
  const headers = Array.from(allHeaders)

  const lines: string[] = []
  lines.push(`# LPG Inspection Export`)
  lines.push(`# Generated: ${new Date().toLocaleString()}`)
  lines.push(`# Total Records: ${rows.length}`)
  lines.push("")
  lines.push(headers.join(","))
  rows.forEach((r) => {
    lines.push(headers.map((h) => csvEscape(r[h])).join(","))
  })
  return lines.join("\n")
}

// Main export function using ApiService
export async function exportInspectionsViaApiService(
  inspections: AnyRecord[] | undefined | null,
  deliveryMen: AnyRecord[] | undefined | null,
  fileName: string = "inspections_export",
  token: string
) {
  console.log("Inspections", inspections)
  console.log("Delivery Men", deliveryMen)
  // console.log(inspections)
  // console.log(inspections)
  try {
    const data = Array.isArray(inspections) ? inspections : []
    if (!data.length) {
      throw new Error("No inspections available to export.")
    }

    console.log("Starting export with:", {
      recordCount: data.length,
      hasToken: !!token,
      fileName
    })

    if (Platform.OS === "web") {
      // Web: Direct CSV download (client-side processing)
      const deliveryMap: Record<string, string> = {}
      ;(Array.isArray(deliveryMen) ? deliveryMen : []).forEach((dm: AnyRecord) => {
        const id = dm._id || dm.id
        if (id) deliveryMap[id] = dm.name || ""
      })

      const flatRows = data.map((row) => flattenInspection(row, deliveryMap))
      const csv = buildCSV(flatRows)

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${fileName}.csv`
      a.style.display = "none"
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      
      return { success: true, message: "File downloaded successfully" }
    }

    // Mobile: Use ApiService to send data to backend
    try {
      // Set the token in ApiService
      ApiService.setToken(token)

      // Call the export API
      const result = await ApiService.exportInspections(data, deliveryMen || [], fileName)

      console.log("Export API result:", result)

      if (!result.success) {
        throw new Error(result.error || "Export failed")
      }

      const exportUrl = result.downloadUrl

      if (!exportUrl) {
        throw new Error("No download URL received from server")
      }

      // Open the download URL in browser
      console.log("Opening export URL:", exportUrl)
      const canOpen = await Linking.canOpenURL(exportUrl)
      
      if (canOpen) {
        await Linking.openURL(exportUrl)
        return { 
          success: true, 
          message: "Opening download page...",
          url: exportUrl 
        }
      } else {
        throw new Error("Cannot open download URL")
      }

    } catch (networkError: any) {
      console.error("Network export error:", networkError)
      throw new Error(networkError.message || "Network error occurred")
    }

  } catch (err: any) {
    console.error("Export error:", err)
    throw new Error(err?.message || "Failed to export inspections.")
  }
}

// React Native Component that uses the export function
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useAuth } from '../context/AuthContext'; // Adjust path as needed
import { useData } from '../context/DataContext'; // Adjust path as needed

interface ExportComponentProps {
  style?: any;
  textStyle?: any;
  fileName?: string;
}

export const ExportComponent: React.FC<ExportComponentProps> = ({
  style,
  textStyle,
  fileName = "my_inspections_export"
}) => {
  const { token } = useAuth();
  const { inspections, deliveryMen } = useData();

  const handleExport = async () => {
    try {
      if (!token) {
        Alert.alert("Error", "No authentication token found. Please log in again.");
        return;
      }

      if (!inspections || inspections.length === 0) {
        Alert.alert("No Data", "No inspections available to export.");
        return;
      }

      // Show loading message
      Alert.alert("Export", "Preparing your CSV export...", [{ text: "OK" }]);

      // Call the export function
      const result = await exportInspectionsViaApiService(
        inspections,
        deliveryMen,
        fileName,
        token
      );

      if (result.success) {
        Alert.alert("Success", result.message);
      }

    } catch (error: any) {
      console.error("Export button error:", error);
      Alert.alert("Export Error", error.message || "Failed to export inspections");
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.exportButton, style]} 
      onPress={handleExport}
    >
      <Text style={[styles.exportButtonText, textStyle]}>
        Export to CSV
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  exportButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

// Alternative simple function for inline use
export const handleInlineExport = async (
  inspections: AnyRecord[],
  deliveryMen: AnyRecord[],
  token: string,
  fileName: string = "inspections_export"
) => {
  try {
    if (!token) {
      Alert.alert("Error", "No authentication token found.");
      return;
    }

    if (!inspections?.length) {
      Alert.alert("No Data", "No inspections available to export.");
      return;
    }

    Alert.alert("Export", "Preparing your CSV export...");

    const result = await exportInspectionsViaApiService(
      inspections,
      deliveryMen,
      fileName,
      token
    );

    if (result.success) {
      Alert.alert("Success", result.message);
    }

  } catch (error: any) {
    Alert.alert("Export Error", error.message || "Failed to export inspections");
  }
};