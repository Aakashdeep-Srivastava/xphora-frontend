// lib/api/index.ts - Main API exports
export * from './client';
export * from './config';

// Service exports
export * from './auth';
export * from './incidents';
export * from './alerts';
export * from './maps';
export * from './weather';
export * from './ai';
export * from './emergency';
export * from './notifications';
export * from './reports';
export * from './media';

// Convenience object with all APIs
import { authAPI } from './auth';
import { incidentsAPI } from './incidents';
import { alertsAPI } from './alerts';
import { mapsAPI } from './maps';
import { weatherAPI } from './weather';
import { aiAPI } from './ai';
import { emergencyAPI } from './emergency';
import { notificationsAPI } from './notifications';
import { reportsAPI } from './reports';
import { mediaAPI } from './media';

export const api = {
  auth: authAPI,
  incidents: incidentsAPI,
  alerts: alertsAPI,
  maps: mapsAPI,
  weather: weatherAPI,
  ai: aiAPI,
  emergency: emergencyAPI,
  notifications: notificationsAPI,
  reports: reportsAPI,
  media: mediaAPI,
};

// Default export
export default api;
