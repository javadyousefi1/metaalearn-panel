import { httpService } from './http.service';
import {
  LoginCredentials,
  LoginResponse,
  User,
  UserRole,
  Permission,
  OtpLoginCredentials,
  OtpResponse,
  VerifyOtpRequest,
  ResendOtpRequest
} from '@/types';

// Set to true to use mock data for development
const USE_MOCK_AUTH = false;

/**
 * Authentication Service
 * Handles all auth-related API calls
 */
export const authService = {
  /**
   * Login user - Send OTP
   */
  login: async (credentials: OtpLoginCredentials): Promise<OtpResponse> => {
    // Mock authentication for development
    if (USE_MOCK_AUTH) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            message: 'OTP sent successfully',
            expiresIn: 120,
          });
        }, 1000);
      });
    }

    // Real API call
    const response = await httpService.post<OtpResponse>('/Authentication/login', credentials);
    return response.data;
  },

  /**
   * Verify OTP and complete login
   */
  verifyOtp: async (data: VerifyOtpRequest): Promise<LoginResponse> => {
    // Mock authentication for development
    if (USE_MOCK_AUTH) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            token: 'mock-token-' + Date.now(),
            refreshToken: 'mock-refresh-token-' + Date.now(),
            user: {
              info: {
                fullNameFa: 'کاربر تستی',
                firstNameFa: 'کاربر',
                lastNameFa: 'تستی',
                phoneNumber: data.phoneNumber,
                imageUrl: '',
                username: 'testuser',
                address: null,
                referralId: 'REF123',
                isProfileComplete: true,
                identityStatusType: 0,
                identityMessage: '',
                id: '1',
              },
              profile: null,
              creditCards: [],
              wallet: null,
              invoices: [],
            },
          });
        }, 1000);
      });
    }

    // Real API call
    const response = await httpService.post<LoginResponse>('/Authentication/VerifyOtp', data);
    return response.data;
  },

  /**
   * Resend OTP
   */
  resendOtp: async (data: ResendOtpRequest): Promise<OtpResponse> => {
    // Mock authentication for development
    if (USE_MOCK_AUTH) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            message: 'OTP resent successfully',
            expiresIn: 120,
          });
        }, 1000);
      });
    }

    // Real API call
    const response = await httpService.put<OtpResponse>('/Authentication/ResendOtp', data);
    return response.data;
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
   * Forgot password
   */
  forgotPassword: async (email: string): Promise<void> => {
    await httpService.post('/auth/forgot-password', { email });
  },

  /**
   * Reset password
   */
  resetPassword: async (token: string, password: string): Promise<void> => {
    await httpService.post('/auth/reset-password', { token, password });
  },

  /**
   * Change password
   */
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await httpService.post('/auth/change-password', { currentPassword, newPassword });
  },
};
