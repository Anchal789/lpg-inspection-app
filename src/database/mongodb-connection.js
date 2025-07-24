// MongoDB Atlas Connection Example
// This file shows how to connect to MongoDB Atlas from your backend

const { MongoClient } = require("mongodb")

// MongoDB Atlas Connection String
// Replace <username>, <password>, <cluster-url> with your actual credentials
const MONGODB_URI = "mongodb+srv://anchaldeshmukh789:mukhDesh%407228@cluster0.k0qctek.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

class DatabaseConnection {
  constructor() {
    this.client = null
    this.db = null
  }

  async connect() {
    try {
      this.client = new MongoClient(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })

      await this.client.connect()
      this.db = this.client.db("lpg-inspection")
      console.log("Connected to MongoDB Atlas successfully")

      return this.db
    } catch (error) {
      console.error("MongoDB connection error:", error)
      throw error
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.close()
      console.log("Disconnected from MongoDB Atlas")
    }
  }

  getDatabase() {
    return this.db
  }
}

module.exports = new DatabaseConnection()
