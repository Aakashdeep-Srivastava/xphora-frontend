// Application configuration with environment variable validation

// OAuth configuration embedded directly
const oauthClientConfig = {
  web: {
    client_id: "14008380219-anv3mffil9pg5i7tiiu0iqsmnci1rsar.apps.googleusercontent.com",
    project_id: "studious-pulsar-467012-d7",
    client_secret: "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",
  },
}

export const config = {
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || "XphoraPulse",
    version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    description: "Real-time city intelligence for Bengaluru citizens",
  },

  apis: {
    googleMaps: {
      key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
      required: true,
    },
    gemini: {
      key: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
      required: false, // Optional - falls back to mock analysis
    },
  },

  oauth: {
    clientId: oauthClientConfig.web.client_id,
    projectId: oauthClientConfig.web.project_id,
    clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET || oauthClientConfig.web.client_secret,
  },

  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  },

  features: {
    analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true",
    pwa: process.env.NEXT_PUBLIC_ENABLE_PWA !== "false",
    offlineMode: process.env.NEXT_PUBLIC_ENABLE_OFFLINE_MODE !== "false",
  },

  analytics: {
    gaId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  },

  // Default locations
  defaultLocation: {
    lat: 12.9716,
    lng: 77.5946,
    city: "Bengaluru",
    district: "Bengaluru Urban",
    country: "India",
  },

  // API endpoints - now using Google APIs
  endpoints: {
    geocoding: "https://maps.googleapis.com/maps/api/geocode/json",
    places: "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
    directions: "https://maps.googleapis.com/maps/api/directions/json",
  },

  // Cache settings
  cache: {
    locationTTL: 10 * 60 * 1000, // 10 minutes
    weatherTTL: 15 * 60 * 1000, // 15 minutes
    trafficTTL: 5 * 60 * 1000, // 5 minutes
  },
}

// Validation function for required environment variables
export function validateConfig() {
  const errors: string[] = []
  const warnings: string[] = []

  // Check required API keys
  if (config.apis.googleMaps.required && !config.apis.googleMaps.key) {
    errors.push("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is required")
  }

  // Check OAuth configuration
  if (!config.oauth.clientId) {
    errors.push("OAuth Client ID is missing from configuration")
  }

  if (!config.oauth.projectId) {
    errors.push("OAuth Project ID is missing from configuration")
  }

  // Check Firebase config (optional but recommended)
  const firebaseKeys = Object.entries(config.firebase)
  const missingFirebaseKeys = firebaseKeys.filter(([_, value]) => !value).map(([key]) => key)

  if (missingFirebaseKeys.length > 0) {
    warnings.push("Firebase configuration incomplete. Authentication features will be disabled.")
    console.warn("Missing Firebase keys:", missingFirebaseKeys)
  }

  if (warnings.length > 0) {
    console.warn("Configuration warnings:", warnings)
  }

  if (errors.length > 0) {
    throw new Error(`Configuration errors:\n${errors.join("\n")}`)
  }

  return true
}

// Environment detection
export const isDevelopment = process.env.NODE_ENV === "development"
export const isProduction = process.env.NODE_ENV === "production"
export const isTest = process.env.NODE_ENV === "test"
