// lib/api/auth/index.ts
import { apiClient } from '../client';
import { API_CONFIG } from '../config';
import type { ApiResponse, User } from '../../../types/api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  notificationPreferences?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

export class AuthAPI {
  // Login with email and password
  static async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<ApiResponse<AuthResponse>>(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      data
    );
  }

  // Register new user
  static async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<ApiResponse<AuthResponse>>(
      '/auth/register',
      data
    );
  }

  // Login with Google OAuth
  static async loginWithGoogle(idToken: string): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<ApiResponse<AuthResponse>>(
      '/auth/google',
      { idToken }
    );
  }

  // Logout user
  static async logout(): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>(
      API_CONFIG.ENDPOINTS.AUTH.LOGOUT
    );
  }

  // Verify email
  static async verifyEmail(data: VerifyEmailRequest): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>(
      API_CONFIG.ENDPOINTS.AUTH.VERIFY,
      data
    );
  }

  // Refresh authentication token
  static async refreshToken(data: RefreshTokenRequest): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<ApiResponse<AuthResponse>>(
      API_CONFIG.ENDPOINTS.AUTH.REFRESH,
      data
    );
  }

  // Request password reset
  static async requestPasswordReset(data: ResetPasswordRequest): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>(
      '/auth/password-reset',
      data
    );
  }

  // Update password
  static async updatePassword(data: UpdatePasswordRequest): Promise<ApiResponse<void>> {
    return apiClient.put<ApiResponse<void>>(
      '/auth/password',
      data
    );
  }

  // Get current user profile
  static async getProfile(): Promise<ApiResponse<User>> {
    return apiClient.get<ApiResponse<User>>('/auth/profile');
  }

  // Update user profile
  static async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<User>> {
    return apiClient.put<ApiResponse<User>>('/auth/profile', data);
  }

  // Delete user account
  static async deleteAccount(): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>('/auth/account');
  }

  // Check if user is authenticated
  static async checkAuth(): Promise<ApiResponse<User>> {
    return apiClient.get<ApiResponse<User>>('/auth/check');
  }

  // Enable two-factor authentication
  static async enableTwoFactor(): Promise<ApiResponse<{ qrCode: string; backupCodes: string[] }>> {
    return apiClient.post<ApiResponse<{ qrCode: string; backupCodes: string[] }>>(
      '/auth/2fa/enable'
    );
  }

  // Verify two-factor authentication setup
  static async verifyTwoFactor(code: string): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>('/auth/2fa/verify', { code });
  }

  // Disable two-factor authentication
  static async disableTwoFactor(code: string): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>('/auth/2fa/disable', { code });
  }
}

// Export individual methods for convenience
export const authAPI = {
  login: AuthAPI.login,
  register: AuthAPI.register,
  loginWithGoogle: AuthAPI.loginWithGoogle,
  logout: AuthAPI.logout,
  verifyEmail: AuthAPI.verifyEmail,
  refreshToken: AuthAPI.refreshToken,
  requestPasswordReset: AuthAPI.requestPasswordReset,
  updatePassword: AuthAPI.updatePassword,
  getProfile: AuthAPI.getProfile,
  updateProfile: AuthAPI.updateProfile,
  deleteAccount: AuthAPI.deleteAccount,
  checkAuth: AuthAPI.checkAuth,
  enableTwoFactor: AuthAPI.enableTwoFactor,
  verifyTwoFactor: AuthAPI.verifyTwoFactor,
  disableTwoFactor: AuthAPI.disableTwoFactor,
};