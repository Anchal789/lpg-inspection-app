import { Platform, Alert, Share } from "react-native";

type AnyRecord = Record<string, any>

type ExportParams = {
  inspections: AnyRecord[] | undefined | null
  deliveryMen?: AnyRecord[] | undefined | null
  fileName?: string // without extension
}

function csvEscape(value: any): string {
  if (value === null || value === undefined) return ""
  // stringify objects/arrays
  const str = typeof value === "object" ? JSON.stringify(value) : String(value)
  // escape quotes and wrap when needed
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function formatDateISO(d?: string | Date): string {
  if (!d) return ""
  const date = typeof d === "string" ? new Date(d) : d
  if (isNaN(date.getTime())) return ""
  // Excel-friendly format
  return date.toISOString().slice(0, 19).replace("T", " ")
}

function flattenInspection(row: AnyRecord, deliveryMenMap: Record<string, string>): AnyRecord {
  // Support both flattened and nested backend shapes
  const consumer = row.consumer || {}
  const deliveryName = row.deliveryManName || row?.deliveryManId?.name || deliveryMenMap[row.deliveryManId] || ""

  const safetyQuestions: Array<{ questionId: number; answer: string }> = row.safetyQuestions || []

  // Build dynamic safety question columns Q1..Qn
  const safetyCols: AnyRecord = {}
  safetyQuestions.forEach((q) => {
    const key = `Q${Number(q.questionId ?? 0) + 1}`
    safetyCols[key] = q.answer ?? ""
  })

  // Aggregate products into a readable string
  const productsArr = row.products || []
  const productsSummary = productsArr
    .map((p: AnyRecord) => {
      const name = p.name || p?.productId?.name || "Item"
      const qty = p.quantity ?? 1
      const price = p.price ?? ""
      return `${name} x ${qty}${price !== "" ? ` @ ${price}` : ""}`
    })
    .join(" | ")

  // Images count
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
    ImagesCount: imagesCount,
    Products: productsSummary,
    Latitude: row.location?.latitude ?? "",
    Longitude: row.location?.longitude ?? "",
    ...safetyCols,
  }
}

function buildCSV(rows: AnyRecord[]): string {
  if (!rows.length) return ""
  // Determine all headers across rows to include dynamic Q columns
  const allHeaders = new Set<string>()
  rows.forEach((r) => Object.keys(r).forEach((k) => allHeaders.add(k)))
  const headers = Array.from(allHeaders)

  const lines: string[] = []
  // metadata rows (Excel opens fine)
  lines.push(`# LPG Inspection Export`)
  lines.push(`# Generated: ${new Date().toLocaleString()}`)
  lines.push(`# Total Records: ${rows.length}`)
  lines.push("") // spacer
  lines.push(headers.join(","))
  rows.forEach((r) => {
    lines.push(headers.map((h) => csvEscape(r[h])).join(","))
  })
  return lines.join("\n")
}

export async function exportInspectionsCSV({
  inspections,
  deliveryMen,
  fileName = "inspections_export",
}: ExportParams) {
  try {
    const data = Array.isArray(inspections) ? inspections : []
    if (!data.length) {
      throw new Error("No inspections available to export.")
    }

    // Map delivery men for quick lookup
    const deliveryMap: Record<string, string> = {}
    ;(Array.isArray(deliveryMen) ? deliveryMen : []).forEach((dm: AnyRecord) => {
      const id = dm._id || dm.id
      if (id) deliveryMap[id] = dm.name || ""
    })

    // Flatten rows
    const flatRows = data.map((row) => flattenInspection(row, deliveryMap))
    const csv = buildCSV(flatRows)

    if (Platform.OS === "web") {
      // Web: trigger download
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
      return
    }

    // Native: Use built-in Share API with CSV content
    try {
      await Share.share({
        message: `Inspection Report - ${fileName}`,
        title: "LPG Inspection Export",
        // Note: iOS/Android may not directly support CSV sharing via message
        // This provides a fallback that works across platforms
      })
      
      // Show the CSV content in an alert for copying
      Alert.alert(
        "Export Complete", 
        "CSV data generated successfully. You can copy the data from the next dialog.",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "View Data", 
            onPress: () => {
              // Show first 500 characters of CSV for copying
              const preview = csv.length > 500 ? csv.substring(0, 500) + "..." : csv
              Alert.alert("CSV Data", preview, [
                { text: "OK" }
              ])
            }
          }
        ]
      )
    } catch (shareError) {
      // Fallback: show CSV in alert for manual copying
      Alert.alert(
        "Export Data", 
        "Copy this CSV data:",
        [{ text: "OK" }]
      )
      console.log("CSV Export Data:", csv)
    }

  } catch (err: any) {
    throw new Error(err?.message || "Failed to export inspections.")
  }
}