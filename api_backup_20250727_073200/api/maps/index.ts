// lib/api/maps/index.ts
import { apiClient } from '../client';
import { API_CONFIG } from '../config';
import type { 
  ApiResponse, 
  Location,
  PlaceSearchRequest,
  DirectionsRequest
} from '../../../types/api';

export interface GeocodeQuery {
  address: string;
}

export interface ReverseGeocodeQuery {
  latitude: number;
  longitude: number;
}

export interface TrafficInfo {
  status: 'light' | 'moderate' | 'heavy' | 'severe';
  duration: number; // in seconds
  distance: number; // in meters
  incidents?: string[];
}

export class MapsAPI {
  static async geocode(query: GeocodeQuery): Promise<ApiResponse<Location[]>> {
    return apiClient.post<ApiResponse<Location[]>>(
      API_CONFIG.ENDPOINTS.MAPS.GEOCODE,
      query
    );
  }

  static async reverseGeocode(query: ReverseGeocodeQuery): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>(
      API_CONFIG.ENDPOINTS.MAPS.REVERSE_GEOCODE,
      query
    );
  }

  static async searchPlaces(query: PlaceSearchRequest): Promise<ApiResponse<any[]>> {
    return apiClient.post<ApiResponse<any[]>>(
      API_CONFIG.ENDPOINTS.MAPS.PLACES_SEARCH,
      query
    );
  }

  static async getDirections(query: DirectionsRequest): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>(
      API_CONFIG.ENDPOINTS.MAPS.DIRECTIONS,
      query
    );
  }

  static async getTrafficInfo(origin: Location, destination: Location): Promise<ApiResponse<TrafficInfo>> {
    return apiClient.post<ApiResponse<TrafficInfo>>(
      API_CONFIG.ENDPOINTS.MAPS.TRAFFIC,
      { origin, destination }
    );
  }
}

export const mapsAPI = {
  geocode: MapsAPI.geocode,
  reverseGeocode: MapsAPI.reverseGeocode,
  searchPlaces: MapsAPI.searchPlaces,
  getDirections: MapsAPI.getDirections,
  getTrafficInfo: MapsAPI.getTrafficInfo,
};
