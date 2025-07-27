// lib/api/emergency/index.ts
import { apiClient } from '../client';
import { API_CONFIG } from '../config';
import type { 
  ApiResponse, 
  Location
} from '../../../types/api';

export interface EmergencyAlert {
  id: string;
  type: 'fire' | 'medical' | 'police' | 'natural_disaster' | 'civil' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: Location;
  contactInfo?: string;
  reportedBy: string;
  status: 'active' | 'responding' | 'resolved';
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmergencyAlertRequest {
  type: EmergencyAlert['type'];
  priority: EmergencyAlert['priority'];
  title: string;
  description: string;
  location: Location;
  contactInfo?: string;
}

export class EmergencyAPI {
  static async createAlert(data: CreateEmergencyAlertRequest): Promise<ApiResponse<EmergencyAlert>> {
    return apiClient.post<ApiResponse<EmergencyAlert>>(
      API_CONFIG.ENDPOINTS.EMERGENCY.CREATE_ALERT,
      data
    );
  }

  static async getActiveAlerts(): Promise<ApiResponse<EmergencyAlert[]>> {
    return apiClient.get<ApiResponse<EmergencyAlert[]>>(
      API_CONFIG.ENDPOINTS.EMERGENCY.GET_ACTIVE
    );
  }

  static async updateStatus(id: string, status: EmergencyAlert['status']): Promise<ApiResponse<EmergencyAlert>> {
    const endpoint = API_CONFIG.ENDPOINTS.EMERGENCY.UPDATE_STATUS.replace('{id}', id);
    return apiClient.put<ApiResponse<EmergencyAlert>>(endpoint, { status });
  }

  static async notifyAuthorities(id: string, authorities: string[]): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>(
      API_CONFIG.ENDPOINTS.EMERGENCY.NOTIFY_AUTHORITIES,
      { alertId: id, authorities }
    );
  }
}

export const emergencyAPI = {
  createAlert: EmergencyAPI.createAlert,
  getActiveAlerts: EmergencyAPI.getActiveAlerts,
  updateStatus: EmergencyAPI.updateStatus,
  notifyAuthorities: EmergencyAPI.notifyAuthorities,
};
