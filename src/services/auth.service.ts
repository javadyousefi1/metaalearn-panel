import { httpService } from './http.service';
import { LoginCredentials, LoginResponse, User, UserRole, Permission } from '@/types';

// Set to true to use mock data for development
const USE_MOCK_AUTH = true;

/**
 * Authentication Service
 * Handles all auth-related API calls
 */
export const authService = {
  /**
   * Login user
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    // Mock authentication for development
    if (USE_MOCK_AUTH) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simple mock validation
          if (credentials.email && credentials.password) {
            resolve({
              token: 'mock-token-' + Date.now(),
              refreshToken: 'mock-refresh-token-' + Date.now(),
              user: {
                id: '1',
                email: credentials.email,
                firstName: 'John',
                lastName: 'Doe',
                avatar: undefined,
                role: UserRole.SUPER_ADMIN,
                permissions: Object.values(Permission),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            });
          } else {
            reject(new Error('Invalid credentials'));
          }
        }, 1000); // Simulate network delay
      });
    }

    // Real API call
    const response = await httpService.post<LoginResponse>('/auth/login', credentials);
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
