# 🚀 Complete LPG Inspection App Deployment & Build Guide

## 📋 Table of Contents
1. [Backend Hosting Options](#backend-hosting)
2. [Frontend Build & Distribution](#frontend-builds)
3. [Local Development Setup](#local-development)
4. [Troubleshooting Network Issues](#troubleshooting)
5. [Alternative Local Development](#alternatives)

---

## 🌐 Backend Hosting Options

### Option 1: Railway (Recommended - Free & Easy)

#### Step 1: Prepare Your Code
\`\`\`bash
# Navigate to backend directory
cd backend

# Create railway.json for configuration
echo '{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/health"
  }
}' > railway.json
\`\`\`

#### Step 2: Deploy to Railway
1. **Visit**: https://railway.app
2. **Sign up** with GitHub
3. **Create New Project** → **Deploy from GitHub repo**
4. **Connect** your repository
5. **Add Environment Variables**:
   \`\`\`
   MONGODB_CONNECTION_STRING=mongodb+srv://anchaldeshmukh789:YOUR_PASSWORD@cluster0.k0qctek.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   AWS_ACCESS_KEY_ID=AKIA6RELHSGNKSXIL73V
   AWS_SECRET_ACCESS_KEY=D/t1pMt2y4L3p3oAutbixessDGFIkG/uB5YhxhUq
   AWS_REGION=us-east-1
   S3_BUCKET_NAME=mandatoryinspection
   JWT_SECRET=7a8b9c2d4e5f6g8h1i2j3k4l5m6n7o8p9q0r1s2t3u4v5w6x7y8z9a0b1c2d3e4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0v1w2x3y4z5
   SUPER_ADMIN_SAP_CODE=000000
   SUPER_ADMIN_PHONE=0987654321
   SUPER_ADMIN_PASSWORD=7228
   SUPER_ADMIN_EMAIL=admin@severity.com
   PORT=3000
   \`\`\`
6. **Deploy** - Railway will give you a URL like: `https://your-app-name.railway.app`

### Option 2: Render (Free Tier)

#### Step 1: Deploy to Render
1. **Visit**: https://render.com
2. **Sign up** with GitHub
3. **New Web Service** → **Connect Repository**
4. **Configuration**:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
5. **Add Environment Variables** (same as Railway)
6. **Deploy** - You'll get URL like: `https://your-app-name.onrender.com`

### Option 3: Heroku (Paid but Reliable)

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
heroku config:set AWS_SECRET_ACCESS_KEY="your_secret_key"
heroku config:set AWS_REGION="us-east-1"
heroku config:set S3_BUCKET_NAME="mandatoryinspection"
heroku config:set JWT_SECRET="your_jwt_secret"
heroku config:set SUPER_ADMIN_SAP_CODE="000000"
heroku config:set SUPER_ADMIN_PHONE="0987654321"
heroku config:set SUPER_ADMIN_PASSWORD="7228"
heroku config:set SUPER_ADMIN_EMAIL="admin@severity.com"

# Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku main
\`\`\`

---

## 📱 Frontend Build & Distribution

### Option 1: Expo Application Services (EAS) - Recommended

#### Step 1: Setup EAS
\`\`\`bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo (create account if needed)
eas login

# Initialize EAS in your project
eas build:configure
\`\`\`

#### Step 2: Update API URL
Update `src/api/api-service.js`:
\`\`\`javascript
const API_BASE_URL = "https://your-deployed-backend-url.railway.app/api"
\`\`\`

#### Step 3: Build APK
\`\`\`bash
# Build Android APK
eas build --platform android --profile preview

# Build iOS (requires Apple Developer account)
eas build --platform ios --profile preview
\`\`\`

#### Step 4: Download & Install
- EAS will provide download links
- Download APK and install on Android devices
- For iOS, you need Apple Developer account

### Option 2: Expo Development Build

\`\`\`bash
# Create development build
npx create-expo-app --template

# Build for Android
eas build --platform android --profile development

# Build for iOS  
eas build --platform ios --profile development
\`\`\`

### Option 3: React Native CLI (Advanced)

\`\`\`bash
# Eject from Expo (WARNING: This is irreversible)
npx expo eject

# Build Android APK
cd android
./gradlew assembleRelease

# APK will be in: android/app/build/outputs/apk/release/
\`\`\`

---

## 💻 Local Development Setup

### Fix Network Connection Issues

#### Step 1: Find Your Computer's IP Address

**Windows:**
\`\`\`cmd
ipconfig
# Look for "IPv4 Address" under your active network adapter
# Example: 192.168.1.100
\`\`\`

**Mac/Linux:**
\`\`\`bash
ifconfig
# Look for "inet" under your active network (usually en0 or wlan0)
# Example: 192.168.1.100
\`\`\`

#### Step 2: Update API Service
Update `src/api/api-service.js`:
\`\`\`javascript
// Replace with your computer's IP address
const API_BASE_URL = "http://192.168.1.100:3000/api"  // Use YOUR IP
\`\`\`

#### Step 3: Start Backend with Network Access
\`\`\`bash
cd backend
npm run start-network
\`\`\`

#### Step 4: Start Frontend
\`\`\`bash
# In project root
npx expo start --tunnel
# OR
npx expo start --lan
\`\`\`

### Alternative: Use Expo Tunnel
\`\`\`bash
# This creates a public URL that works anywhere
npx expo start --tunnel
\`\`\`

---

## 🔧 Troubleshooting Network Issues

### Issue 1: "Failed to connect to /192.168.0.9"

**Solutions:**
1. **Check Firewall**: Disable Windows Firewall temporarily
2. **Use Correct IP**: Make sure you're using the right IP address
3. **Use Tunnel Mode**:
   \`\`\`bash
   npx expo start --tunnel
   \`\`\`
4. **Check Port**: Make sure port 3000 and 8081 are not blocked

### Issue 2: "Network request failed"

**Solutions:**
1. **Update API URL** in `api-service.js`
2. **Restart Metro bundler**:
   \`\`\`bash
   npx expo start --clear
   \`\`\`
3. **Check Backend Status**: Visit `http://YOUR_IP:3000/api/health`

### Issue 3: "Expo CLI not working"

**Solutions:**
1. **Update Expo CLI**:
   \`\`\`bash
   npm install -g @expo/cli@latest
   \`\`\`
2. **Clear Cache**:
   \`\`\`bash
   npx expo start --clear
   \`\`\`
3. **Reinstall Dependencies**:
   \`\`\`bash
   rm -rf node_modules
   npm install
   \`\`\`

---

## 🛠 Alternative Local Development Options

### Option 1: Android Studio Emulator

#### Setup Android Studio:
1. **Download**: Android Studio from https://developer.android.com/studio
2. **Install**: Follow installation wizard
3. **Create AVD**: Tools → AVD Manager → Create Virtual Device
4. **Start Emulator**: Launch your virtual device

#### Run App on Emulator:
\`\`\`bash
# Start Metro bundler
npx expo start

# Press 'a' to open on Android emulator
# OR
npx expo start --android
\`\`\`

### Option 2: Physical Device with USB

#### Enable USB Debugging:
1. **Developer Options**: Settings → About Phone → Tap "Build Number" 7 times
2. **USB Debugging**: Settings → Developer Options → Enable USB Debugging
3. **Connect Device**: Use USB cable

#### Run on Device:
\`\`\`bash
# Install ADB tools
npm install -g @expo/cli

# Connect device and run
npx expo start --android
\`\`\`

### Option 3: Web Development

\`\`\`bash
# Run on web browser (limited functionality)
npx expo start --web
\`\`\`

---

## 📦 Production Deployment Checklist

### Backend Deployment:
- [ ] Environment variables set correctly
- [ ] MongoDB connection string updated
- [ ] AWS S3 credentials configured
- [ ] Health check endpoint working
- [ ] CORS configured for production domain

### Frontend Deployment:
- [ ] API base URL updated to production
- [ ] App signed for release
- [ ] Icons and splash screens configured
- [ ] App store metadata prepared
- [ ] Testing on multiple devices completed

### Security:
- [ ] Change default super admin credentials
- [ ] Use strong JWT secret
- [ ] Enable HTTPS
- [ ] Validate all inputs
- [ ] Rate limiting implemented

---

## 🎯 Quick Start Commands

### Deploy Backend (Railway):
\`\`\`bash
# 1. Push code to GitHub
git add .
git commit -m "Deploy backend"
git push origin main

# 2. Go to railway.app and deploy from GitHub
# 3. Add environment variables
# 4. Get your API URL
\`\`\`

### Build Android APK:
\`\`\`bash
# 1. Update API URL in api-service.js
# 2. Build with EAS
eas build --platform android --profile preview

# 3. Download and install APK
\`\`\`

### Test Locally:
\`\`\`bash
# Terminal 1: Start backend
cd backend
npm run start-network

# Terminal 2: Start frontend  
npx expo start --tunnel

# Use Expo Go app to scan QR code
\`\`\`

---

## 📞 Support

**Developer Contact:**
- **Name**: Anchal Deshmukh
- **Email**: anchaldesh7@gmail.com
- **Phone**: +91 7747865603

**For Issues:**
1. Check this guide first
2. Try the troubleshooting steps
3. Contact developer with error details

---

## 🔗 Useful Links

- **Railway**: https://railway.app
- **Render**: https://render.com  
- **Expo EAS**: https://expo.dev/eas
- **MongoDB Atlas**: https://cloud.mongodb.com
- **AWS S3**: https://aws.amazon.com/s3/

---

**🎉 Your app will be live and accessible from anywhere once deployed!**
