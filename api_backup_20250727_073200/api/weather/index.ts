// lib/api/weather/index.ts
import { apiClient } from '../client';
import { API_CONFIG } from '../config';
import type { 
  ApiResponse, 
  WeatherData,
  Location
} from '../../../types/api';

export interface WeatherQuery {
  latitude: number;
  longitude: number;
  units?: 'metric' | 'imperial';
}

export interface ForecastQuery extends WeatherQuery {
  days?: number; // 1-7 days
}

export interface WeatherAlert {
  id: string;
  title: string;
  description: string;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  urgency: 'immediate' | 'expected' | 'future';
  areas: string[];
  startTime: string;
  endTime: string;
}

export class WeatherAPI {
  static async getCurrent(query: WeatherQuery): Promise<ApiResponse<WeatherData>> {
    const searchParams = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      searchParams.append(key, value.toString());
    });

    const endpoint = `${API_CONFIG.ENDPOINTS.WEATHER.CURRENT}?${searchParams.toString()}`;
    return apiClient.get<ApiResponse<WeatherData>>(endpoint);
  }

  static async getForecast(query: ForecastQuery): Promise<ApiResponse<WeatherData[]>> {
    const searchParams = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      searchParams.append(key, value.toString());
    });

    const endpoint = `${API_CONFIG.ENDPOINTS.WEATHER.FORECAST}?${searchParams.toString()}`;
    return apiClient.get<ApiResponse<WeatherData[]>>(endpoint);
  }

  static async getAirQuality(location: Location): Promise<ApiResponse<any>> {
    const searchParams = new URLSearchParams({
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
    });

    const endpoint = `${API_CONFIG.ENDPOINTS.WEATHER.AIR_QUALITY}?${searchParams.toString()}`;
    return apiClient.get<ApiResponse<any>>(endpoint);
  }

  static async getAlerts(location: Location): Promise<ApiResponse<WeatherAlert[]>> {
    const searchParams = new URLSearchParams({
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
    });

    const endpoint = `${API_CONFIG.ENDPOINTS.WEATHER.ALERTS}?${searchParams.toString()}`;
    return apiClient.get<ApiResponse<WeatherAlert[]>>(endpoint);
  }
}

export const weatherAPI = {
  getCurrent: WeatherAPI.getCurrent,
  getForecast: WeatherAPI.getForecast,
  getAirQuality: WeatherAPI.getAirQuality,
  getAlerts: WeatherAPI.getAlerts,
};
