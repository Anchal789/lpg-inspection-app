// Database Schema and Collection Structure
// This file defines the structure of your MongoDB collections

// Collection: distributors
const distributorSchema = {
  _id: "ObjectId", // Auto-generated
  sapCode: "String", // Unique identifier
  agencyName: "String",
  adminName: "String",
  password: "String", // Should be hashed
  createdAt: "Date",
  updatedAt: "Date",
  isActive: "Boolean",
}

// Collection: delivery_men
const deliveryManSchema = {
  _id: "ObjectId",
  distributorId: "ObjectId", // Reference to distributor
  name: "String",
  phone: "String",
  password: "String", // Should be hashed
  totalInspections: "Number",
  totalSales: "Number",
  assignedProducts: [
    {
      productId: "ObjectId",
      quantity: "Number",
      price: "Number",
      minPrice: "Number",
      assignedAt: "Date",
    },
  ],
  createdAt: "Date",
  updatedAt: "Date",
  isActive: "Boolean",
}

// Collection: products
const productSchema = {
  _id: "ObjectId",
  distributorId: "ObjectId", // Reference to distributor
  name: "String",
  price: "Number",
  minPrice: "Number",
  quantity: "Number",
  category: "String", // e.g., "cylinder", "regulator", "stove"
  createdAt: "Date",
  updatedAt: "Date",
  isActive: "Boolean",
}

// Collection: inspections (Main collection - largest data)
const inspectionSchema = {
  _id: "ObjectId",
  inspectionId: "String", // Custom ID like "INS-2024-001"
  distributorId: "ObjectId",
  deliveryManId: "ObjectId",

  // Consumer Information
  consumer: {
    name: "String",
    consumerNumber: "String",
    mobileNumber: "String",
    address: "String",
  },

  // Safety Questions (12 questions - updated)
  safetyQuestions: [
    {
      questionId: "Number", // 0-11
      question: "String",
      answer: "String", // "yes" or "no"
    },
  ],

  // Special fields for specific questions
  surakshaHoseDueDate: "String", // For question 5 when answer is yes

  // Images
  images: [
    {
      imageId: "String",
      imageUrl: "String", // URL to stored image
      uploadedAt: "Date",
      fileSize: "Number", // in bytes
    },
  ],

  // Products sold during inspection
  products: [
    {
      productId: "ObjectId",
      name: "String",
      price: "Number",
      quantity: "Number",
      subtotal: "Number",
    },
  ],

  // Discount information
  hotplateExchange: "Boolean", // -450 if true
  otherDiscount: "Number", // Additional discount amount
  totalDiscount: "Number", // Calculated total discount
  subtotalAmount: "Number", // Before discount

  // Location data
  location: {
    latitude: "Number",
    longitude: "Number",
    address: "String", // Reverse geocoded address
    accuracy: "Number",
  },

  // Totals and status
  totalAmount: "Number", // Final amount after discounts
  status: "String", // "completed", "pending", "issues_found"
  passedQuestions: "Number",
  failedQuestions: "Number",

  // Timestamps
  inspectionDate: "Date",
  createdAt: "Date",
  updatedAt: "Date",
}

// Collection: inspection_images (Optional - if you want to separate images)
const inspectionImageSchema = {
  _id: "ObjectId",
  inspectionId: "ObjectId",
  imageUrl: "String",
  fileName: "String",
  fileSize: "Number",
  mimeType: "String",
  uploadedAt: "Date",
}

module.exports = {
  distributorSchema,
  deliveryManSchema,
  productSchema,
  inspectionSchema,
  inspectionImageSchema,
}
