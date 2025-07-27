// API Configuration for XphoraPulse
export const API_CONFIG = {
  // Base URLs
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://us-central1-xphorapulse.cloudfunctions.net'
    : 'http://localhost:5001/xphorapulse/us-central1',
  
  // API Endpoints
  ENDPOINTS: {
    // Authentication
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      VERIFY: '/auth/verify',
      REFRESH: '/auth/refresh',
    },
    
    // Incidents Management
    INCIDENTS: {
      CREATE: '/incidents/create',
      GET_ALL: '/incidents',
      GET_BY_ID: '/incidents/{id}',
      UPDATE: '/incidents/{id}',
      DELETE: '/incidents/{id}',
      GET_NEARBY: '/incidents/nearby',
    },
    
    // Alerts System
    ALERTS: {
      CREATE: '/alerts/create',
      GET_ALL: '/alerts',
      GET_ACTIVE: '/alerts/active',
      UPDATE_STATUS: '/alerts/{id}/status',
      SUBSCRIBE: '/alerts/subscribe',
    },
    
    // Maps & Location
    MAPS: {
      GEOCODE: '/maps/geocode',
      REVERSE_GEOCODE: '/maps/reverse-geocode',
      PLACES_SEARCH: '/maps/places/search',
      DIRECTIONS: '/maps/directions',
      TRAFFIC: '/maps/traffic',
    },
    
    // Weather Services
    WEATHER: {
      CURRENT: '/weather/current',
      FORECAST: '/weather/forecast',
      AIR_QUALITY: '/weather/air-quality',
      ALERTS: '/weather/alerts',
    },
    
    // AI Services
    AI: {
      ANALYZE_IMAGE: '/ai/analyze-image',
      VERIFY_CONTENT: '/ai/verify-content',
      GENERATE_INSIGHTS: '/ai/generate-insights',
      SENTIMENT_ANALYSIS: '/ai/sentiment',
    },
    
    // Emergency Services
    EMERGENCY: {
      CREATE_ALERT: '/emergency/alert',
      GET_ACTIVE: '/emergency/active',
      UPDATE_STATUS: '/emergency/{id}/status',
      NOTIFY_AUTHORITIES: '/emergency/notify',
    },
    
    // Notifications
    NOTIFICATIONS: {
      SEND: '/notifications/send',
      SUBSCRIBE: '/notifications/subscribe',
      UNSUBSCRIBE: '/notifications/unsubscribe',
      HISTORY: '/notifications/history',
    },
    
    // Reports & Analytics
    REPORTS: {
      GENERATE: '/reports/generate',
      GET_STATS: '/reports/stats',
      EXPORT: '/reports/export',
      DASHBOARD_DATA: '/reports/dashboard',
    },
    
    // Media Upload
    MEDIA: {
      UPLOAD: '/media/upload',
      GET_SIGNED_URL: '/media/signed-url',
      DELETE: '/media/{id}',
      PROCESS: '/media/process',
    },
  },
  
  // Request timeouts (ms)
  TIMEOUTS: {
    DEFAULT: 10000,
    UPLOAD: 30000,
    AI_PROCESSING: 60000,
  },
  
  // Error codes
  ERROR_CODES: {
    NETWORK_ERROR: 'NETWORK_ERROR',
    AUTH_FAILED: 'AUTH_FAILED',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    SERVER_ERROR: 'SERVER_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    RATE_LIMITED: 'RATE_LIMITED',
  }
} as const;

export type ApiEndpoint = keyof typeof API_CONFIG.ENDPOINTS;
