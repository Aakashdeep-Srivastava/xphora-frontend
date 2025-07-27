// Common API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Location Types
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'emergency';
  isVerified: boolean;
  createdAt: string;
  lastActive: string;
}

// Incident Types
export interface Incident {
  id: string;
  title: string;
  description: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  status: IncidentStatus;
  location: Location;
  reportedBy: string;
  reportedAt: string;
  updatedAt: string;
  mediaUrls?: string[];
  verificationStatus: 'pending' | 'verified' | 'rejected';
  aiAnalysis?: AIAnalysis;
}

export type IncidentCategory = 
  | 'traffic' 
  | 'emergency' 
  | 'infrastructure' 
  | 'weather' 
  | 'safety' 
  | 'civic' 
  | 'other';

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'reported' | 'verified' | 'in_progress' | 'resolved' | 'closed';

// Alert Types
export interface Alert {
  id: string;
  title: string;
  message: string;
  type: AlertType;
  severity: AlertSeverity;
  location?: Location;
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
  affectedRadius?: number; // in meters
}

export type AlertType = 
  | 'emergency' 
  | 'weather' 
  | 'traffic' 
  | 'safety' 
  | 'infrastructure' 
  | 'event';

export type AlertSeverity = 'info' | 'warning' | 'severe' | 'critical';

// Weather Types
export interface WeatherData {
  location: Location;
  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    windDirection: number;
    visibility: number;
    uvIndex: number;
    condition: string;
    icon: string;
  };
  airQuality: {
    aqi: number;
    level: string;
    pm25: number;
    pm10: number;
    no2: number;
    so2: number;
    co: number;
    o3: number;
  };
  updatedAt: string;
}

// AI Analysis Types
export interface AIAnalysis {
  confidence: number;
  tags: string[];
  category: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  verificationStatus: 'verified' | 'needs_review' | 'rejected';
  analysis: string;
  processedAt: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  data?: Record<string, any>;
  createdAt: string;
}

export type NotificationType = 
  | 'incident_update' 
  | 'alert' 
  | 'emergency' 
  | 'system' 
  | 'reminder';

// Media Types
export interface MediaUpload {
  id: string;
  url: string;
  type: 'image' | 'video' | 'audio';
  size: number;
  metadata?: Record<string, any>;
  uploadedAt: string;
}

// Request/Response Types for specific endpoints
export interface CreateIncidentRequest {
  title: string;
  description: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  location: Location;
  mediaFiles?: File[];
}

export interface CreateAlertRequest {
  title: string;
  message: string;
  type: AlertType;
  severity: AlertSeverity;
  location?: Location;
  affectedRadius?: number;
  expiresAt?: string;
}

export interface UpdateIncidentStatusRequest {
  status: IncidentStatus;
  notes?: string;
}

// Maps API Types
export interface PlaceSearchRequest {
  query: string;
  location?: Location;
  radius?: number;
  type?: string;
}

export interface DirectionsRequest {
  origin: Location;
  destination: Location;
  travelMode?: 'driving' | 'walking' | 'transit' | 'bicycling';
}

// Statistics Types
export interface DashboardStats {
  totalIncidents: number;
  activeAlerts: number;
  resolvedToday: number;
  averageResponseTime: number;
  incidentsByCategory: Record<IncidentCategory, number>;
  incidentsBySeverity: Record<IncidentSeverity, number>;
  trendsData: {
    date: string;
    incidents: number;
    resolved: number;
  }[];
}
