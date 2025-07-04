# MongoDB Atlas Storage Analysis for LPG Inspection App

## Memory Usage Per Inspection

### Base Inspection Document (without images)
\`\`\`json
{
  "_id": "ObjectId (12 bytes)",
  "inspectionId": "String (15 chars = 15 bytes)",
  "distributorId": "ObjectId (12 bytes)",
  "deliveryManId": "ObjectId (12 bytes)",
  "consumer": {
    "name": "String (avg 25 chars = 25 bytes)",
    "consumerNumber": "String (15 chars = 15 bytes)",
    "mobileNumber": "String (15 chars = 15 bytes)",
    "address": "String (avg 100 chars = 100 bytes)"
  },
  "safetyQuestions": [
    // 12 questions × (question text + answer)
    // Avg 50 chars per question + 3 chars answer = 53 × 12 = 636 bytes
  ],
  "products": [
    // Avg 2 products × 80 bytes each = 160 bytes
  ],
  "location": {
    "latitude": "Number (8 bytes)",
    "longitude": "Number (8 bytes)",
    "address": "String (50 chars = 50 bytes)",
    "accuracy": "Number (8 bytes)"
  },
  "totalAmount": "Number (8 bytes)",
  "status": "String (10 chars = 10 bytes)",
  "passedQuestions": "Number (4 bytes)",
  "failedQuestions": "Number (4 bytes)",
  "inspectionDate": "Date (8 bytes)",
  "createdAt": "Date (8 bytes)",
  "updatedAt": "Date (8 bytes)"
}
\`\`\`

### Memory Calculation:
- **Base document**: ~1.2 KB
- **Images metadata** (3 images avg): ~300 bytes
- **MongoDB overhead**: ~200 bytes
- **Total per inspection**: ~1.7 KB

### With Image Storage (if stored in MongoDB):
- **Average image size**: 200-500 KB each
- **3 images per inspection**: 600-1500 KB
- **Total with images**: 601.7 - 1501.7 KB per inspection

## Storage Projections

### Scenario 1: 1000 inspections/month
- **Without images**: 1.7 MB/month
- **With images**: 601.7 MB - 1.5 GB/month

### Scenario 2: 10,000 inspections/month
- **Without images**: 17 MB/month
- **With images**: 6 GB - 15 GB/month

### Annual Storage (10,000 inspections/month):
- **Without images**: 204 MB/year
- **With images**: 72 GB - 180 GB/year

## MongoDB Atlas Free Tier Limits:
- **Storage**: 512 MB
- **Can handle**: ~300,000 inspections without images
- **Can handle**: ~340 inspections with images

## Recommended Approach:
1. **Store inspection data in MongoDB** (lightweight)
2. **Store images separately** (AWS S3, Cloudinary, etc.)
3. **Store only image URLs in MongoDB**

This approach reduces MongoDB storage by 99% while maintaining full functionality.
