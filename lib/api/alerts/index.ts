// lib/api/alerts/index.ts
import { apiClient } from '../client';
import { API_CONFIG } from '../config';
import type { 
  ApiResponse, 
  PaginatedResponse,
  Alert, 
  CreateAlertRequest,
  Location,
  AlertType,
  AlertSeverity
} from '../../../types/api';

export interface GetAlertsQuery {
  page?: number;
  limit?: number;
  type?: AlertType;
  severity?: AlertSeverity;
  isActive?: boolean;
  location?: Location;
  radius?: number;
}

export interface AlertSubscription {
  types: AlertType[];
  severities: AlertSeverity[];
  location?: Location;
  radius?: number;
}

export class AlertsAPI {
  static async create(data: CreateAlertRequest): Promise<ApiResponse<Alert>> {
    return apiClient.post<ApiResponse<Alert>>(
      API_CONFIG.ENDPOINTS.ALERTS.CREATE,
      data
    );
  }

  static async getAll(query: GetAlertsQuery = {}): Promise<PaginatedResponse<Alert>> {
    const searchParams = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, typeof value === 'object' ? JSON.stringify(value) : value.toString());
      }
    });

    const endpoint = `${API_CONFIG.ENDPOINTS.ALERTS.GET_ALL}?${searchParams.toString()}`;
    return apiClient.get<PaginatedResponse<Alert>>(endpoint);
  }

  static async getActive(): Promise<ApiResponse<Alert[]>> {
    return apiClient.get<ApiResponse<Alert[]>>(API_CONFIG.ENDPOINTS.ALERTS.GET_ACTIVE);
  }

  static async updateStatus(id: string, isActive: boolean): Promise<ApiResponse<Alert>> {
    const endpoint = API_CONFIG.ENDPOINTS.ALERTS.UPDATE_STATUS.replace('{id}', id);
    return apiClient.put<ApiResponse<Alert>>(endpoint, { isActive });
  }

  static async subscribe(subscription: AlertSubscription): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>(
      API_CONFIG.ENDPOINTS.ALERTS.SUBSCRIBE,
      subscription
    );
  }

  static async unsubscribe(): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>('/alerts/subscription');
  }

  static async getSubscription(): Promise<ApiResponse<AlertSubscription>> {
    return apiClient.get<ApiResponse<AlertSubscription>>('/alerts/subscription');
  }
}

export const alertsAPI = {
  create: AlertsAPI.create,
  getAll: AlertsAPI.getAll,
  getActive: AlertsAPI.getActive,
  updateStatus: AlertsAPI.updateStatus,
  subscribe: AlertsAPI.subscribe,
  unsubscribe: AlertsAPI.unsubscribe,
  getSubscription: AlertsAPI.getSubscription,
};
