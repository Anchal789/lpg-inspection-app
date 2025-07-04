# LPG Inspection App - Complete Setup Instructions

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- MongoDB Atlas account
- AWS S3 account
- Android Studio (for Android) or Xcode (for iOS)

### 1. Backend Setup

#### Step 1: Clone and Install Backend Dependencies
\`\`\`bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Install additional required packages
npm install express mongoose cors multer aws-sdk jsonwebtoken bcryptjs dotenv uuid nodemon
\`\`\`

#### Step 2: Environment Configuration
Create a `.env` file in the backend directory with your credentials:
\`\`\`env
# MongoDB Atlas Connection
MONGODB_CONNECTION_STRING=mongodb+srv://anchaldeshmukh789:YOUR_PASSWORD@cluster0.k0qctek.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=AKIA6RELHSGNKSXIL73V
AWS_SECRET_ACCESS_KEY=D/t1pMt2y4L3p3oAutbixessDGFIkG/uB5YhxhUq
AWS_REGION=us-east-1
S3_BUCKET_NAME=mandatoryinspection

# Server Configuration
PORT=3000
API_BASE_URL=http://localhost:3000/api

# JWT Secret (Generate a strong secret)
JWT_SECRET=7a8b9c2d4e5f6g8h1i2j3k4l5m6n7o8p9q0r1s2t3u4v5w6x7y8z9a0b1c2d3e4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0v1w2x3y4z5

# Super Admin Credentials
SUPER_ADMIN_SAP_CODE=000000
SUPER_ADMIN_PHONE=0987654321
SUPER_ADMIN_PASSWORD=7228
SUPER_ADMIN_EMAIL=admin@severity.com
\`\`\`

#### Step 3: Start Backend Server
\`\`\`bash
# Development mode with auto-restart
npm run dev

# Or production mode
npm start
\`\`\`

The server will start on `http://localhost:3000`

### 2. Frontend Setup

#### Step 1: Install Frontend Dependencies
\`\`\`bash
# Navigate to project root
cd ..

# Install Expo CLI globally (if not installed)
npm install -g @expo/cli

# Install project dependencies
npm install

# Install additional React Native packages
npm install @react-navigation/native @react-navigation/stack react-native-screens react-native-safe-area-context react-native-gesture-handler expo-image-picker expo-location react-native-chart-kit react-native-svg
\`\`\`

#### Step 2: Update API Base URL
Update the API base URL in `src/api/api-service.js`:

**For Local Development:**
\`\`\`javascript
const API_BASE_URL = "http://localhost:3000/api" // Your local IP
\`\`\`

**For Physical Device Testing:**
\`\`\`javascript
const API_BASE_URL = "http://YOUR_LOCAL_IP:3000/api" // Replace with your computer's IP
\`\`\`

**For Production:**
\`\`\`javascript
const API_BASE_URL = "https://your-deployed-api.com/api"
\`\`\`

#### Step 3: Start the App
\`\`\`bash
# Start Expo development server
npx expo start

# Or with specific platform
npx expo start --android
npx expo start --ios
\`\`\`

### 3. Database Setup

#### MongoDB Atlas Configuration
1. **Create MongoDB Atlas Account**: Go to https://cloud.mongodb.com
2. **Create Cluster**: Choose free tier
3. **Create Database User**: 
   - Username: `anchaldeshmukh789`
   - Password: `YOUR_SECURE_PASSWORD`
4. **Whitelist IP**: Add `0.0.0.0/0` for development (restrict in production)
5. **Get Connection String**: Replace password in connection string

#### Collections Created Automatically
The app will automatically create these collections:
- `distributors`
- `distributorrequests`
- `deliverymen`
- `products`
- `inspections`

### 4. AWS S3 Setup

#### S3 Bucket Configuration
1. **Create S3 Bucket**: Name it `mandatoryinspection`
2. **Set Bucket Policy**: Allow public read access
\`\`\`json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::mandatoryinspection/*"
        }
    ]
}
\`\`\`
3. **Create IAM User**: With S3 full access permissions
4. **Generate Access Keys**: Use in environment variables

### 5. Running on Physical Device

#### For Android:
1. **Enable Developer Options**: Go to Settings > About Phone > Tap Build Number 7 times
2. **Enable USB Debugging**: Developer Options > USB Debugging
3. **Install Expo Go**: Download from Play Store
4. **Connect Device**: Use USB or scan QR code
5. **Update API URL**: Use your computer's IP address

#### For iOS:
1. **Install Expo Go**: Download from App Store
2. **Connect to Same Network**: Ensure device and computer on same WiFi
3. **Scan QR Code**: From Expo development server
4. **Update API URL**: Use your computer's IP address

#### Find Your Local IP:
**Windows:**
\`\`\`bash
ipconfig
\`\`\`
**Mac/Linux:**
\`\`\`bash
ifconfig
\`\`\`

### 6. Deployment Options

#### Backend Deployment

**Option 1: Heroku**
\`\`\`bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create app
heroku create lpg-inspection-api

# Set environment variables
heroku config:set MONGODB_CONNECTION_STRING="your_connection_string"
heroku config:set AWS_ACCESS_KEY_ID="your_access_key"
# ... set all environment variables

# Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku main
\`\`\`

**Option 2: Railway**
1. Go to https://railway.app
2. Connect GitHub repository
3. Add environment variables
4. Deploy automatically

**Option 3: DigitalOcean App Platform**
1. Create account on DigitalOcean
2. Create new app from GitHub
3. Configure environment variables
4. Deploy

#### Frontend Deployment

**Option 1: Expo Application Services (EAS)**
\`\`\`bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios

# Submit to stores
eas submit --platform android
eas submit --platform ios
\`\`\`

**Option 2: Standalone APK**
\`\`\`bash
# Build APK
npx expo build:android

# Build IPA
npx expo build:ios
\`\`\`

### 7. Testing Credentials

#### Super Admin Login:
- SAP Code: `000000`
- Phone: `0987654321`
- Password: `7228`

#### Test Distributor (after approval):
- SAP Code: `DIST001`
- Phone: `admin`
- Password: `admin123`

#### Test Delivery Man (after approval):
- SAP Code: `DIST001`
- Phone: `9876543210`
- Password: `delivery123`

### 8. Troubleshooting

#### Common Issues:

**1. MongoDB Connection Error:**
- Check connection string
- Verify IP whitelist
- Ensure database user has correct permissions

**2. S3 Upload Error:**
- Verify AWS credentials
- Check bucket permissions
- Ensure bucket exists

**3. API Connection Error:**
- Check if backend server is running
- Verify API base URL
- Check network connectivity

**4. Expo Build Error:**
- Clear Expo cache: `npx expo start --clear`
- Update Expo CLI: `npm install -g @expo/cli@latest`
- Check package.json dependencies

#### Error Handling:
All errors show contact information:
- **Developer**: Anchal Deshmukh
- **Email**: anchaldesh7@gmail.com
- **Phone**: +91 7747865603

### 9. Production Checklist

#### Security:
- [ ] Change default super admin credentials
- [ ] Use strong JWT secret
- [ ] Restrict MongoDB IP whitelist
- [ ] Enable HTTPS
- [ ] Validate all inputs
- [ ] Rate limiting implemented

#### Performance:
- [ ] Database indexing
- [ ] Image compression
- [ ] API response caching
- [ ] Error logging
- [ ] Monitoring setup

#### Deployment:
- [ ] Environment variables set
- [ ] Database backups configured
- [ ] SSL certificates installed
- [ ] Domain configured
- [ ] App store submissions

### 10. Support

For any issues or questions:
- **Email**: anchaldesh7@gmail.com
- **Phone**: +91 7747865603
- **GitHub Issues**: Create issue in repository

### 11. License

This project is proprietary software developed by Anchal Deshmukh.
