// lib/api/notifications/index.ts
import { apiClient } from '../client';
import { API_CONFIG } from '../config';
import type { 
  ApiResponse, 
  PaginatedResponse,
  Notification,
  NotificationType
} from '../../../types/api';

export interface SendNotificationRequest {
  title: string;
  message: string;
  type: NotificationType;
  userId?: string;
  userIds?: string[];
  data?: Record<string, any>;
  scheduledFor?: string;
}

export interface NotificationSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationPreferences {
  types: NotificationType[];
  channels: ('push' | 'email' | 'sms')[];
  quietHours?: {
    start: string; // HH:mm format
    end: string;   // HH:mm format
  };
}

export class NotificationsAPI {
  static async send(data: SendNotificationRequest): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>(
      API_CONFIG.ENDPOINTS.NOTIFICATIONS.SEND,
      data
    );
  }

  static async subscribe(subscription: NotificationSubscription): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>(
      API_CONFIG.ENDPOINTS.NOTIFICATIONS.SUBSCRIBE,
      subscription
    );
  }

  static async unsubscribe(): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(
      API_CONFIG.ENDPOINTS.NOTIFICATIONS.UNSUBSCRIBE
    );
  }

  static async getHistory(page = 1, limit = 20): Promise<PaginatedResponse<Notification>> {
    const endpoint = `${API_CONFIG.ENDPOINTS.NOTIFICATIONS.HISTORY}?page=${page}&limit=${limit}`;
    return apiClient.get<PaginatedResponse<Notification>>(endpoint);
  }

  static async markAsRead(notificationIds: string[]): Promise<ApiResponse<void>> {
    return apiClient.put<ApiResponse<void>>('/notifications/read', { notificationIds });
  }

  static async markAllAsRead(): Promise<ApiResponse<void>> {
    return apiClient.put<ApiResponse<void>>('/notifications/read-all');
  }

  static async updatePreferences(preferences: NotificationPreferences): Promise<ApiResponse<void>> {
    return apiClient.put<ApiResponse<void>>('/notifications/preferences', preferences);
  }

  static async getPreferences(): Promise<ApiResponse<NotificationPreferences>> {
    return apiClient.get<ApiResponse<NotificationPreferences>>('/notifications/preferences');
  }
}

export const notificationsAPI = {
  send: NotificationsAPI.send,
  subscribe: NotificationsAPI.subscribe,
  unsubscribe: NotificationsAPI.unsubscribe,
  getHistory: NotificationsAPI.getHistory,
  markAsRead: NotificationsAPI.markAsRead,
  markAllAsRead: NotificationsAPI.markAllAsRead,
  updatePreferences: NotificationsAPI.updatePreferences,
  getPreferences: NotificationsAPI.getPreferences,
};
