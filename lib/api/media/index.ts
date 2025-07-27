// lib/api/media/index.ts
import { apiClient } from '../client';
import { API_CONFIG } from '../config';
import type { 
  ApiResponse, 
  MediaUpload
} from '../../../types/api';

export interface GetSignedUrlRequest {
  fileName: string;
  fileType: string;
  fileSize: number;
}

export interface ProcessMediaRequest {
  mediaId: string;
  operations: {
    resize?: { width: number; height: number };
    compress?: { quality: number };
    watermark?: boolean;
  };
}

export class MediaAPI {
  static async upload(file: File): Promise<ApiResponse<MediaUpload>> {
    return apiClient.upload<ApiResponse<MediaUpload>>(
      API_CONFIG.ENDPOINTS.MEDIA.UPLOAD,
      file,
      API_CONFIG.TIMEOUTS.UPLOAD
    );
  }

  static async getSignedUrl(request: GetSignedUrlRequest): Promise<ApiResponse<{ uploadUrl: string; mediaId: string }>> {
    return apiClient.post<ApiResponse<{ uploadUrl: string; mediaId: string }>>(
      API_CONFIG.ENDPOINTS.MEDIA.GET_SIGNED_URL,
      request
    );
  }

  static async delete(id: string): Promise<ApiResponse<void>> {
    const endpoint = API_CONFIG.ENDPOINTS.MEDIA.DELETE.replace('{id}', id);
    return apiClient.delete<ApiResponse<void>>(endpoint);
  }

  static async process(request: ProcessMediaRequest): Promise<ApiResponse<MediaUpload>> {
    return apiClient.post<ApiResponse<MediaUpload>>(
      API_CONFIG.ENDPOINTS.MEDIA.PROCESS,
      request
    );
  }

  static async getMetadata(id: string): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>(`/media/${id}/metadata`);
  }
}

export const mediaAPI = {
  upload: MediaAPI.upload,
  getSignedUrl: MediaAPI.getSignedUrl,
  delete: MediaAPI.delete,
  process: MediaAPI.process,
  getMetadata: MediaAPI.getMetadata,
};
