// Database Operations - CRUD operations for your collections
const dbConnection = require("./mongodb-connection")

class DatabaseOperations {
  constructor() {
    this.db = null
  }

  async initialize() {
    this.db = await dbConnection.connect()
  }

  // ==================== INSPECTION OPERATIONS ====================

  async createInspection(inspectionData) {
    try {
      const collection = this.db.collection("inspections")

      // Generate custom inspection ID
      const inspectionCount = await collection.countDocuments()
      const inspectionId = `INS-${new Date().getFullYear()}-${String(inspectionCount + 1).padStart(4, "0")}`

      const inspection = {
        ...inspectionData,
        inspectionId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = await collection.insertOne(inspection)
      console.log("Inspection created:", result.insertedId)

      return {
        success: true,
        inspectionId: result.insertedId,
        customId: inspectionId,
      }
    } catch (error) {
      console.error("Error creating inspection:", error)
      return { success: false, error: error.message }
    }
  }

  async getInspectionsByDeliveryMan(deliveryManId, page = 1, limit = 20) {
    try {
      const collection = this.db.collection("inspections")
      const skip = (page - 1) * limit

      const inspections = await collection
        .find({ deliveryManId: deliveryManId })
        .sort({ inspectionDate: -1 })
        .skip(skip)
        .limit(limit)
        .toArray()

      const total = await collection.countDocuments({ deliveryManId: deliveryManId })

      return {
        success: true,
        data: inspections,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }
    } catch (error) {
      console.error("Error fetching inspections:", error)
      return { success: false, error: error.message }
    }
  }

  async searchInspections(filters) {
    try {
      const collection = this.db.collection("inspections")
      const query = {}

      // Build query based on filters
      if (filters.deliveryManId) {
        query.deliveryManId = filters.deliveryManId
      }

      if (filters.consumerName) {
        query["consumer.name"] = { $regex: filters.consumerName, $options: "i" }
      }

      if (filters.consumerNumber) {
        query["consumer.consumerNumber"] = { $regex: filters.consumerNumber, $options: "i" }
      }

      if (filters.dateFrom && filters.dateTo) {
        query.inspectionDate = {
          $gte: new Date(filters.dateFrom),
          $lte: new Date(filters.dateTo),
        }
      }

      const inspections = await collection
        .find(query)
        .sort({ inspectionDate: -1 })
        .limit(filters.limit || 50)
        .toArray()

      return {
        success: true,
        data: inspections,
        count: inspections.length,
      }
    } catch (error) {
      console.error("Error searching inspections:", error)
      return { success: false, error: error.message }
    }
  }

  // ==================== DELIVERY MAN OPERATIONS ====================

  async createDeliveryMan(deliveryManData) {
    try {
      const collection = this.db.collection("delivery_men")

      const deliveryMan = {
        ...deliveryManData,
        totalInspections: 0,
        totalSales: 0,
        assignedProducts: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      }

      const result = await collection.insertOne(deliveryMan)
      return { success: true, deliveryManId: result.insertedId }
    } catch (error) {
      console.error("Error creating delivery man:", error)
      return { success: false, error: error.message }
    }
  }

  async updateDeliveryManStats(deliveryManId, inspectionAmount) {
    try {
      const collection = this.db.collection("delivery_men")

      await collection.updateOne(
        { _id: deliveryManId },
        {
          $inc: {
            totalInspections: 1,
            totalSales: inspectionAmount,
          },
          $set: {
            updatedAt: new Date(),
          },
        },
      )

      return { success: true }
    } catch (error) {
      console.error("Error updating delivery man stats:", error)
      return { success: false, error: error.message }
    }
  }

  // ==================== PRODUCT OPERATIONS ====================

  async assignProductToDeliveryMan(deliveryManId, productData) {
    try {
      const collection = this.db.collection("delivery_men")

      await collection.updateOne(
        { _id: deliveryManId },
        {
          $push: {
            assignedProducts: {
              ...productData,
              assignedAt: new Date(),
            },
          },
          $set: {
            updatedAt: new Date(),
          },
        },
      )

      return { success: true }
    } catch (error) {
      console.error("Error assigning product:", error)
      return { success: false, error: error.message }
    }
  }

  // ==================== ANALYTICS OPERATIONS ====================

  async getDashboardStats(distributorId) {
    try {
      const inspectionsCollection = this.db.collection("inspections")
      const deliveryMenCollection = this.db.collection("delivery_men")

      // Get total inspections
      const totalInspections = await inspectionsCollection.countDocuments({ distributorId })

      // Get today's inspections
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const todayInspections = await inspectionsCollection.countDocuments({
        distributorId,
        inspectionDate: { $gte: today, $lt: tomorrow },
      })

      // Get total sales
      const salesResult = await inspectionsCollection
        .aggregate([{ $match: { distributorId } }, { $group: { _id: null, totalSales: { $sum: "$totalAmount" } } }])
        .toArray()

      const totalSales = salesResult.length > 0 ? salesResult[0].totalSales : 0

      // Get delivery men count
      const deliveryMenCount = await deliveryMenCollection.countDocuments({ distributorId, isActive: true })

      return {
        success: true,
        data: {
          totalInspections,
          todayInspections,
          totalSales,
          deliveryMenCount,
        },
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
      return { success: false, error: error.message }
    }
  }
}

module.exports = new DatabaseOperations()
