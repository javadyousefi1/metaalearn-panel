import { httpService } from './http.service';
import {
  LoginCredentials,
  LoginResponse,
  User,
  UserRole,
  Permission,
  OtpLoginCredentials,
  TokenResponse,
  VerifyOtpRequest,
  ResendOtpRequest,
  ResetPasswordDoRqDto,
  ResetPasswordRequestOtpRqDto,
} from '@/types';

// Set to true to use mock data for development
const USE_MOCK_AUTH = false;

/**
 * Authentication Service
 * Handles all auth-related API calls
 */
export const authService = {
  /**
   * Login user:
   * - If password is provided and valid => returns { token }
   * - Otherwise => sends OTP and returns null
   */
  login: async (credentials: OtpLoginCredentials): Promise<LoginResponse> => {
    // Mock authentication for development
    if (USE_MOCK_AUTH) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            token: 'mock-token-' + Date.now(),
          });
        }, 1000);
      });
    }

    // Real API call
    const response = await httpService.post<LoginResponse>('/Authentication/Login', credentials);
    return response.data;
  },

  /**
   * Verify OTP and complete login
   */
  verifyOtp: async (data: VerifyOtpRequest): Promise<TokenResponse> => {
    // Mock authentication for development
    if (USE_MOCK_AUTH) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            token: 'mock-token-' + Date.now(),
          });
        }, 1000);
      });
    }

    // Real API call
    const response = await httpService.post<TokenResponse>('/Authentication/VerifyOtp', data);
    return response.data;
  },

  /**
   * Resend OTP
   */
  resendOtp: async (data: ResendOtpRequest): Promise<void> => {
    // Mock authentication for development
    if (USE_MOCK_AUTH) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 1000);
      });
    }

    // Real API call
    await httpService.put('/Authentication/ResendOtp', data);
  },

  /**
   * Reset password: request OTP
   */
  resetPasswordRequestOtp: async (data: ResetPasswordRequestOtpRqDto): Promise<void> => {
    await httpService.post('/Authentication/ResetPassword', data);
  },

  /**
   * Reset password: submit code + new password
   */
  resetPassword: async (data: ResetPasswordDoRqDto): Promise<void> => {
    await httpService.post('/Authentication/ResetPassword', data);
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    if (USE_MOCK_AUTH) {
      return Promise.resolve();
    }
    await httpService.post('/auth/logout');
  },

  /**
   * Register new user
   */
  register: async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<LoginResponse> => {
    const response = await httpService.post<LoginResponse>('/auth/register', data);
    return response.data;
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<User> => {
    const response = await httpService.get<User>('/auth/profile');
    return response.data;
  },

  /**
   * Refresh access token
   */
  refreshToken: async (refreshToken: string): Promise<{ token: string; refreshToken: string }> => {
    const response = await httpService.post<{ token: string; refreshToken: string }>(
      '/auth/refresh',
      { refreshToken }
    );
    return response.data;
  },

  /**
   * Change password
   */
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await httpService.post('/auth/change-password', { currentPassword, newPassword });
  },
};
