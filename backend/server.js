const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const multer = require("multer")
const AWS = require("aws-sdk")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const path = require("path")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))

// AWS S3 Configuration
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
})

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error)
    process.exit(1)
  })

// Import Models
const Distributor = require("./models/Distributor")
const DeliveryMan = require("./models/DeliveryMan")
const Product = require("./models/Product")
const Inspection = require("./models/Inspection")
const DistributorRequest = require("./models/DistributorRequest")

// Import Routes
const authRoutes = require("./routes/auth")
const inspectionRoutes = require("./routes/inspections")
const productRoutes = require("./routes/products")
const deliveryManRoutes = require("./routes/deliveryMen")
const dashboardRoutes = require("./routes/dashboard")
const superAdminRoutes = require("./routes/superAdmin")
const uploadRoutes = require("./routes/upload")

// Import the centralized error handler
const globalErrorHandler = require("./utils/errorHandler")

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/inspections", inspectionRoutes)
app.use("/api/products", productRoutes)
app.use("/api/delivery-men", deliveryManRoutes)
app.use("/api/dashboard", dashboardRoutes)
app.use("/api/super-admin", superAdminRoutes)
app.use("/api/upload", uploadRoutes)

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "LPG Inspection API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    availableEndpoints: [
      "/api/health",
      "/api/auth/*",
      "/api/inspections/*",
      "/api/products/*",
      "/api/delivery-men/*",
      "/api/dashboard/*",
      "/api/super-admin/*",
      "/api/upload/*",
    ],
    contactInfo: {
      developer: "Anchal Deshmukh",
      email: "anchaldesh7@gmail.com",
      phone: "+91 7747865603",
    },
  })
})

// Global error handling middleware (must be last)
app.use(globalErrorHandler)

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📱 API Base URL: http://192.168.227.109:${PORT}/api`)
  console.log(`🏥 Health Check: http://192.168.227.109:${PORT}/api/health`)
})

module.exports = app
