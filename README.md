# LPG Inspection Mobile Application

A comprehensive mobile application for mandatory LPG safety inspections with super admin approval system, MongoDB Atlas integration, and AWS S3 image storage.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- MongoDB Atlas account
- AWS S3 account

### 1. Backend Setup

\`\`\`bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file with your credentials (see .env.example)
cp .env.example .env

# Start development server
npm run dev
\`\`\`

### 2. Frontend Setup

\`\`\`bash
# Install dependencies
npm install

# Start Expo development server
npx expo start
\`\`\`

### 3. Mobile App Testing

**For Physical Device:**
1. Install Expo Go app from App Store/Play Store
2. Update API_BASE_URL in `src/api/api-service.js` to your computer's IP
3. Scan QR code from Expo development server

**For Emulator:**
1. Start Android Studio emulator or iOS Simulator
2. Press 'a' for Android or 'i' for iOS in Expo CLI

## 🔐 Login Credentials

### Super Admin
- SAP Code: `000000`
- Phone: `0987654321`
- Password: `7228`

### Test Distributor (after approval)
- SAP Code: `DIST001`
- Phone: `admin`
- Password: `admin123`

### Test Delivery Man (after approval)
- SAP Code: `DIST001`
- Phone: `9876543210`
- Password: `delivery123`

## 📱 Features

### Super Admin
- Approve/reject distributor registration requests
- View system-wide statistics
- Manage all distributors and delivery personnel

### Distributor Admin
- Manage delivery personnel
- Assign products and stock
- View inspection reports and analytics
- Search and filter inspections

### Delivery Personnel
- Conduct safety inspections
- Capture kitchen images
- Manage product sales
- Apply discounts and special offers
- View personal performance metrics

## 🛠️ Technology Stack

### Backend
- Node.js with Express.js
- MongoDB Atlas for database
- AWS S3 for image storage
- JWT for authentication
- bcryptjs for password hashing

### Frontend
- React Native with Expo
- React Navigation for routing
- Expo Image Picker for camera functionality
- React Native Chart Kit for analytics

## 📊 Database Collections

- `distributors` - Approved distributors
- `distributorrequests` - Pending approval requests
- `deliverymen` - Delivery personnel
- `products` - Available products
- `inspections` - Completed inspections

## 🔧 Configuration

### Environment Variables (.env)
\`\`\`env
MONGODB_CONNECTION_STRING=your_mongodb_connection
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your_bucket_name
JWT_SECRET=your_jwt_secret
SUPER_ADMIN_SAP_CODE=000000
SUPER_ADMIN_PHONE=0987654321
SUPER_ADMIN_PASSWORD=7228
\`\`\`

## 🚀 Deployment

### Backend Deployment Options
1. **Heroku** - Easy deployment with Git
2. **Railway** - Modern deployment platform
3. **DigitalOcean App Platform** - Scalable hosting

### Mobile App Deployment
1. **Expo Application Services (EAS)** - Build and submit to app stores
2. **Standalone APK/IPA** - Direct distribution

## 📞 Support

For technical support or issues:
- **Developer**: Anchal Deshmukh
- **Email**: anchaldesh7@gmail.com
- **Phone**: +91 7747865603

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Role-based access control
- Secure image upload to S3

## 📈 Analytics & Reporting

- Real-time dashboard statistics
- Delivery personnel performance metrics
- Safety inspection trends
- Sales and revenue tracking
- Weekly and monthly reports

## 🎯 Workflow

1. **Distributor Registration** - Submit request with agency details
2. **Super Admin Approval** - Review and approve/reject requests
3. **System Access** - Approved distributors can login and manage operations
4. **Inspection Process** - Delivery personnel conduct safety inspections
5. **Data Storage** - All data securely stored in MongoDB with images in S3

## 📱 Mobile Features

- Offline capability for inspections
- GPS location tracking
- Camera integration for documentation
- Real-time data synchronization
- Push notifications for important updates

---

**© 2024 Anchal Deshmukh. All rights reserved.**
