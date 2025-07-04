const express = require("express")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const Distributor = require("../models/Distributor")
const DeliveryMan = require("../models/DeliveryMan")
const DistributorRequest = require("../models/DistributorRequest")

const router = express.Router()

// Register Distributor Request
router.post("/register-distributor", async (req, res, next) => {
  try {
    const { sapCode, agencyName, adminName, password, deliveryMen } = req.body

    // Validate required fields
    if (!sapCode || !agencyName || !adminName || !password) {
      return res.status(400).json({
        success: false,
        error: "All required fields must be provided",
      })
    }

    // Check if SAP code already exists
    const existingRequest = await DistributorRequest.findOne({ sapCode })
    const existingDistributor = await Distributor.findOne({ sapCode })

    if (existingRequest || existingDistributor) {
      return res.status(409).json({
        success: false,
        error: "SAP code already exists",
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Hash delivery men passwords
    const hashedDeliveryMen = deliveryMen
      ? deliveryMen.map((dm) => ({
          ...dm,
          password: bcrypt.hashSync(dm.password, 10),
        }))
      : []

    // Create distributor request
    const distributorRequest = new DistributorRequest({
      sapCode,
      agencyName,
      adminName,
      password: hashedPassword,
      deliveryMen: hashedDeliveryMen,
    })

    await distributorRequest.save()

    res.status(201).json({
      success: true,
      message: "Registration request submitted successfully",
      data: {
        requestId: distributorRequest._id,
        status: "pending",
        contactInfo: {
          email: "anchaldesh7@gmail.com",
          phone: "+91 7747865603",
          message: "Please contact administrator for approval",
        },
      },
    })
  } catch (error) {
    next(error)
  }
})

// Login
router.post("/login", async (req, res, next) => {
  try {
    const { phone, password, sapCode } = req.body

    if (!phone || !password || !sapCode) {
      return res.status(400).json({
        success: false,
        error: "Phone, password, and SAP code are required",
      })
    }

    // Check for super admin
    if (
      sapCode === process.env.SUPER_ADMIN_SAP_CODE &&
      phone === process.env.SUPER_ADMIN_PHONE &&
      password === process.env.SUPER_ADMIN_PASSWORD
    ) {
      const token = jwt.sign(
        {
          id: "super_admin",
          role: "super_admin",
          sapCode: sapCode,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" },
      )

      return res.json({
        success: true,
        data: {
          user: {
            id: "super_admin",
            name: "Super Admin",
            phone: phone,
            role: "super_admin",
            sapCode: sapCode,
          },
          token,
        },
      })
    }

    // Check distributor
    const distributor = await Distributor.findOne({ sapCode, isActive: true })
    if (distributor && phone === "admin" && (await bcrypt.compare(password, distributor.password))) {
      const token = jwt.sign(
        {
          id: distributor._id,
          role: "admin",
          sapCode: distributor.sapCode,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" },
      )

      return res.json({
        success: true,
        data: {
          user: {
            id: distributor._id,
            name: distributor.adminName,
            phone: phone,
            role: "admin",
            sapCode: distributor.sapCode,
          },
          token,
        },
      })
    }

    // Check delivery man
    const deliveryMan = await DeliveryMan.findOne({ phone, isActive: true }).populate("distributorId")

    if (
      deliveryMan &&
      deliveryMan.distributorId.sapCode === sapCode &&
      (await bcrypt.compare(password, deliveryMan.password))
    ) {
      const token = jwt.sign(
        {
          id: deliveryMan._id,
          role: "delivery",
          sapCode: sapCode,
          distributorId: deliveryMan.distributorId._id,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" },
      )

      return res.json({
        success: true,
        data: {
          user: {
            id: deliveryMan._id,
            name: deliveryMan.name,
            phone: deliveryMan.phone,
            role: "delivery",
            sapCode: sapCode,
          },
          token,
        },
      })
    }

    res.status(401).json({
      success: false,
      error: "Invalid credentials",
    })
  } catch (error) {
    next(error)
  }
})

// Validate SAP Code
router.post("/validate-sap", async (req, res, next) => {
  try {
    const { sapCode } = req.body

    if (!sapCode) {
      return res.status(400).json({
        success: false,
        error: "SAP code is required",
      })
    }

    // Check if it's super admin SAP code
    if (sapCode === process.env.SUPER_ADMIN_SAP_CODE) {
      return res.json({
        success: true,
        data: { valid: true, type: "super_admin" },
      })
    }

    // Check if distributor exists
    const distributor = await Distributor.findOne({ sapCode, isActive: true })

    if (distributor) {
      return res.json({
        success: true,
        data: { valid: true, type: "distributor" },
      })
    }

    res.status(404).json({
      success: false,
      error: "Invalid SAP code",
    })
  } catch (error) {
    next(error)
  }
})

module.exports = router
