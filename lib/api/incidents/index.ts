// lib/api/incidents/index.ts
import { apiClient } from '../client';
import { API_CONFIG } from '../config';
import type { 
  ApiResponse, 
  PaginatedResponse,
  Incident, 
  CreateIncidentRequest,
  UpdateIncidentStatusRequest,
  Location,
  IncidentCategory,
  IncidentSeverity,
  IncidentStatus
} from '../../../types/api';

export interface GetIncidentsQuery {
  page?: number;
  limit?: number;
  category?: IncidentCategory;
  severity?: IncidentSeverity;
  status?: IncidentStatus;
  location?: Location;
  radius?: number; // in meters
  dateFrom?: string;
  dateTo?: string;
  reportedBy?: string;
  search?: string;
}

export interface NearbyIncidentsQuery {
  latitude: number;
  longitude: number;
  radius?: number; // in meters, default 5000
  category?: IncidentCategory;
  severity?: IncidentSeverity;
  limit?: number;
}

export interface IncidentUpdate {
  title?: string;
  description?: string;
  category?: IncidentCategory;
  severity?: IncidentSeverity;
  status?: IncidentStatus;
  notes?: string;
}

export interface IncidentVerification {
  verificationStatus: 'verified' | 'rejected';
  notes?: string;
}

export interface IncidentStats {
  total: number;
  byCategory: Record<IncidentCategory, number>;
  bySeverity: Record<IncidentSeverity, number>;
  byStatus: Record<IncidentStatus, number>;
  recentActivity: {
    date: string;
    reported: number;
    resolved: number;
  }[];
}

export class IncidentsAPI {
  // Create a new incident
  static async create(data: CreateIncidentRequest): Promise<ApiResponse<Incident>> {
    // If media files are included, upload them first
    if (data.mediaFiles && data.mediaFiles.length > 0) {
      const mediaUrls: string[] = [];
      
      for (const file of data.mediaFiles) {
        try {
          const uploadResponse = await apiClient.upload<ApiResponse<{ url: string }>>(
            API_CONFIG.ENDPOINTS.MEDIA.UPLOAD,
            file,
            API_CONFIG.TIMEOUTS.UPLOAD
          );
          
          if (uploadResponse.success && uploadResponse.data) {
            mediaUrls.push(uploadResponse.data.url);
          }
        } catch (error) {
          console.warn('Failed to upload media file:', error);
        }
      }
      
      // Remove mediaFiles from data and add mediaUrls
      const { mediaFiles, ...incidentData } = data;
      return apiClient.post<ApiResponse<Incident>>(
        API_CONFIG.ENDPOINTS.INCIDENTS.CREATE,
        { ...incidentData, mediaUrls }
      );
    }

    return apiClient.post<ApiResponse<Incident>>(
      API_CONFIG.ENDPOINTS.INCIDENTS.CREATE,
      data
    );
  }

  // Get all incidents with filtering
  static async getAll(query: GetIncidentsQuery = {}): Promise<PaginatedResponse<Incident>> {
    const searchParams = new URLSearchParams();
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object') {
          searchParams.append(key, JSON.stringify(value));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });

    const queryString = searchParams.toString();
    const endpoint = queryString 
      ? `${API_CONFIG.ENDPOINTS.INCIDENTS.GET_ALL}?${queryString}`
      : API_CONFIG.ENDPOINTS.INCIDENTS.GET_ALL;

    return apiClient.get<PaginatedResponse<Incident>>(endpoint);
  }

  // Get incident by ID
  static async getById(id: string): Promise<ApiResponse<Incident>> {
    const endpoint = API_CONFIG.ENDPOINTS.INCIDENTS.GET_BY_ID.replace('{id}', id);
    return apiClient.get<ApiResponse<Incident>>(endpoint);
  }

  // Get nearby incidents
  static async getNearby(query: NearbyIncidentsQuery): Promise<ApiResponse<Incident[]>> {
    const searchParams = new URLSearchParams();
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    const endpoint = `${API_CONFIG.ENDPOINTS.INCIDENTS.GET_NEARBY}?${searchParams.toString()}`;
    return apiClient.get<ApiResponse<Incident[]>>(endpoint);
  }

  // Update incident
  static async update(id: string, data: IncidentUpdate): Promise<ApiResponse<Incident>> {
    const endpoint = API_CONFIG.ENDPOINTS.INCIDENTS.UPDATE.replace('{id}', id);
    return apiClient.put<ApiResponse<Incident>>(endpoint, data);
  }

  // Update incident status
  static async updateStatus(id: string, data: UpdateIncidentStatusRequest): Promise<ApiResponse<Incident>> {
    const endpoint = API_CONFIG.ENDPOINTS.INCIDENTS.UPDATE.replace('{id}', id);
    return apiClient.put<ApiResponse<Incident>>(endpoint, data);
  }

  // Delete incident
  static async delete(id: string): Promise<ApiResponse<void>> {
    const endpoint = API_CONFIG.ENDPOINTS.INCIDENTS.DELETE.replace('{id}', id);
    return apiClient.delete<ApiResponse<void>>(endpoint);
  }

  // Verify incident (admin only)
  static async verify(id: string, data: IncidentVerification): Promise<ApiResponse<Incident>> {
    return apiClient.put<ApiResponse<Incident>>(`/incidents/${id}/verify`, data);
  }

  // Add comment to incident
  static async addComment(id: string, comment: string): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>(`/incidents/${id}/comments`, { comment });
  }

  // Get incident comments
  static async getComments(id: string): Promise<ApiResponse<any[]>> {
    return apiClient.get<ApiResponse<any[]>>(`/incidents/${id}/comments`);
  }

  // Vote on incident (upvote/downvote for credibility)
  static async vote(id: string, voteType: 'up' | 'down'): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>(`/incidents/${id}/vote`, { voteType });
  }

  // Report incident as inappropriate
  static async report(id: string, reason: string): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>(`/incidents/${id}/report`, { reason });
  }

  // Get incident statistics
  static async getStats(dateRange?: { from: string; to: string }): Promise<ApiResponse<IncidentStats>> {
    const endpoint = dateRange 
      ? `/incidents/stats?from=${dateRange.from}&to=${dateRange.to}`
      : '/incidents/stats';
    
    return apiClient.get<ApiResponse<IncidentStats>>(endpoint);
  }

  // Follow incident for updates
  static async follow(id: string): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>(`/incidents/${id}/follow`);
  }

  // Unfollow incident
  static async unfollow(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/incidents/${id}/follow`);
  }

  // Get user's followed incidents
  static async getFollowed(): Promise<ApiResponse<Incident[]>> {
    return apiClient.get<ApiResponse<Incident[]>>('/incidents/followed');
  }

  // Export incidents data
  static async export(query: GetIncidentsQuery, format: 'csv' | 'json' = 'csv'): Promise<Blob> {
    const searchParams = new URLSearchParams();
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object') {
          searchParams.append(key, JSON.stringify(value));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });

    searchParams.append('format', format);
    
    const endpoint = `/incidents/export?${searchParams.toString()}`;
    return apiClient.get<Blob>(endpoint);
  }
}

// Export individual methods for convenience
export const incidentsAPI = {
  create: IncidentsAPI.create,
  getAll: IncidentsAPI.getAll,
  getById: IncidentsAPI.getById,
  getNearby: IncidentsAPI.getNearby,
  update: IncidentsAPI.update,
  updateStatus: IncidentsAPI.updateStatus,
  delete: IncidentsAPI.delete,
  verify: IncidentsAPI.verify,
  addComment: IncidentsAPI.addComment,
  getComments: IncidentsAPI.getComments,
  vote: IncidentsAPI.vote,
  report: IncidentsAPI.report,
  getStats: IncidentsAPI.getStats,
  follow: IncidentsAPI.follow,
  unfollow: IncidentsAPI.unfollow,
  getFollowed: IncidentsAPI.getFollowed,
  export: IncidentsAPI.export,
};