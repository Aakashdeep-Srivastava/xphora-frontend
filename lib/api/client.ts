import { API_CONFIG } from './config';

// Base API client with authentication and error handling
export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: HeadersInit;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  // Add authentication token to requests
  private async getAuthHeaders(): Promise<HeadersInit> {
    // Get token from Firebase auth or local storage
    const token = await this.getAuthToken();
    
    return {
      ...this.defaultHeaders,
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async getAuthToken(): Promise<string | null> {
    // This will integrate with your Firebase auth
    try {
      if (typeof window !== 'undefined') {
        const { getAuth } = await import('firebase/auth');
        const auth = getAuth();
        if (auth.currentUser) {
          return await auth.currentUser.getIdToken();
        }
      }
    } catch (error) {
      console.warn('Failed to get auth token:', error);
    }
    return null;
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    timeout: number = API_CONFIG.TIMEOUTS.DEFAULT
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = await this.getAuthHeaders();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new ApiError(
          `Request failed: ${response.status} ${response.statusText}`,
          response.status,
          endpoint
        );
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }

      return response as unknown as T;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408, endpoint);
      }
      
      throw error;
    }
  }

  // HTTP Methods
  async get<T>(endpoint: string, timeout?: number): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' }, timeout);
  }

  async post<T>(endpoint: string, data?: any, timeout?: number): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      },
      timeout
    );
  }

  async put<T>(endpoint: string, data?: any, timeout?: number): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      },
      timeout
    );
  }

  async delete<T>(endpoint: string, timeout?: number): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' }, timeout);
  }

  // File upload method
  async upload<T>(endpoint: string, file: File, timeout?: number): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    const token = await this.getAuthToken();
    const headers: HeadersInit = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        body: formData,
        headers,
      },
      timeout || API_CONFIG.TIMEOUTS.UPLOAD
    );
  }
}

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public endpoint?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Create singleton instance
export const apiClient = new ApiClient();
