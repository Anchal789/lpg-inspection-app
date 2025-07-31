// Environment configuration
const getApiUrl = () => {
  if (process.env.NODE_ENV === "production") {
    return "https://lpg-inspection-backend-production.up.railway.app/api" // Your Railway backend URL
  }
  return "https://lpg-inspection-backend-production.up.railway.app/api" // Local development
}

export const API_BASE_URL = getApiUrl()
export const APP_VERSION = "1.0.0"
export const APP_NAME = "LPG Inspection App"
