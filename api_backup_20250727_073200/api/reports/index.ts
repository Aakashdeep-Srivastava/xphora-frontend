// lib/api/reports/index.ts
import { apiClient } from '../client';
import { API_CONFIG } from '../config';
import type { 
  ApiResponse, 
  DashboardStats
} from '../../../types/api';

export interface ReportRequest {
  type: 'incidents' | 'alerts' | 'performance' | 'user_activity';
  dateRange: {
    from: string;
    to: string;
  };
  filters?: Record<string, any>;
  format?: 'json' | 'csv' | 'pdf';
}

export interface PerformanceMetrics {
  responseTime: {
    avg: number;
    p95: number;
    p99: number;
  };
  errorRate: number;
  uptime: number;
  activeUsers: number;
}

export class ReportsAPI {
  static async generate(request: ReportRequest): Promise<ApiResponse<any> | Blob> {
    if (request.format === 'pdf' || request.format === 'csv') {
      return apiClient.post<Blob>(
        API_CONFIG.ENDPOINTS.REPORTS.GENERATE,
        request
      );
    }

    return apiClient.post<ApiResponse<any>>(
      API_CONFIG.ENDPOINTS.REPORTS.GENERATE,
      request
    );
  }

  static async getStats(dateRange?: { from: string; to: string }): Promise<ApiResponse<DashboardStats>> {
    const endpoint = dateRange 
      ? `${API_CONFIG.ENDPOINTS.REPORTS.GET_STATS}?from=${dateRange.from}&to=${dateRange.to}`
      : API_CONFIG.ENDPOINTS.REPORTS.GET_STATS;
    
    return apiClient.get<ApiResponse<DashboardStats>>(endpoint);
  }

  static async export(type: string, format: 'csv' | 'json' = 'csv'): Promise<Blob> {
    return apiClient.get<Blob>(
      `${API_CONFIG.ENDPOINTS.REPORTS.EXPORT}?type=${type}&format=${format}`
    );
  }

  static async getDashboardData(): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>(
      API_CONFIG.ENDPOINTS.REPORTS.DASHBOARD_DATA
    );
  }

  static async getPerformanceMetrics(): Promise<ApiResponse<PerformanceMetrics>> {
    return apiClient.get<ApiResponse<PerformanceMetrics>>('/reports/performance');
  }
}

export const reportsAPI = {
  generate: ReportsAPI.generate,
  getStats: ReportsAPI.getStats,
  export: ReportsAPI.export,
  getDashboardData: ReportsAPI.getDashboardData,
  getPerformanceMetrics: ReportsAPI.getPerformanceMetrics,
};
