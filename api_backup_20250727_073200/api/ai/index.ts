// lib/api/ai/index.ts
import { apiClient } from '../client';
import { API_CONFIG } from '../config';
import type { 
  ApiResponse, 
  AIAnalysis
} from '../../../types/api';

export interface ImageAnalysisRequest {
  imageUrl?: string;
  imageFile?: File;
  analysisType?: 'incident' | 'verification' | 'classification';
}

export interface ContentVerificationRequest {
  content: string;
  type: 'text' | 'title' | 'description';
}

export interface InsightGenerationRequest {
  data: any[];
  type: 'trends' | 'patterns' | 'predictions' | 'summary';
  timeRange?: string;
}

export interface SentimentAnalysisRequest {
  text: string;
  context?: 'incident' | 'comment' | 'review';
}

export class AIAPI {
  static async analyzeImage(request: ImageAnalysisRequest): Promise<ApiResponse<AIAnalysis>> {
    if (request.imageFile) {
      return apiClient.upload<ApiResponse<AIAnalysis>>(
        API_CONFIG.ENDPOINTS.AI.ANALYZE_IMAGE,
        request.imageFile,
        API_CONFIG.TIMEOUTS.AI_PROCESSING
      );
    }

    return apiClient.post<ApiResponse<AIAnalysis>>(
      API_CONFIG.ENDPOINTS.AI.ANALYZE_IMAGE,
      request,
      API_CONFIG.TIMEOUTS.AI_PROCESSING
    );
  }

  static async verifyContent(request: ContentVerificationRequest): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>(
      API_CONFIG.ENDPOINTS.AI.VERIFY_CONTENT,
      request
    );
  }

  static async generateInsights(request: InsightGenerationRequest): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>(
      API_CONFIG.ENDPOINTS.AI.GENERATE_INSIGHTS,
      request,
      API_CONFIG.TIMEOUTS.AI_PROCESSING
    );
  }

  static async analyzeSentiment(request: SentimentAnalysisRequest): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>(
      API_CONFIG.ENDPOINTS.AI.SENTIMENT_ANALYSIS,
      request
    );
  }
}

export const aiAPI = {
  analyzeImage: AIAPI.analyzeImage,
  verifyContent: AIAPI.verifyContent,
  generateInsights: AIAPI.generateInsights,
  analyzeSentiment: AIAPI.analyzeSentiment,
};
