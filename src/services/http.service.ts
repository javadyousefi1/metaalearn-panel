import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { env } from '@/config';
import { useAuthStore } from '@/store';
import { message } from 'antd';
import {ROUTES} from "@/constants";

/**
 * HTTP Service
 * Centralized HTTP client with interceptors for auth and error handling
 */
class HttpService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: env.apiBaseUrl,
      timeout: env.apiTimeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Try to refresh token
            const refreshToken = useAuthStore.getState().refreshToken;
            if (refreshToken) {
              const response = await this.post<{ token: string; refreshToken: string }>(
                '/auth/refresh',
                { refreshToken }
              );
              const { token, refreshToken: newRefreshToken } = response.data;

              useAuthStore.getState().setAuth(
                useAuthStore.getState().user!,
                token,
                newRefreshToken
              );

              // Retry original request
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, logout user
            useAuthStore.getState().clearAuth();
            window.location.href = '/auth/login';
            return Promise.reject(refreshError);
          }
        }

        // Handle other errors
        this.handleError(error);
        return Promise.reject(error);
      }
    );
  }

  private handleError(error: AxiosError): void {
    if (error.response) {
      // Server responded with error
      const status = error.response.status;
      const data = error.response.data as { message?: string };

      switch (status) {
        case 400:
          message.error(data.message || 'Bad request');
          break;
        case 401:
          message.error('Unauthorized. Please login again.');
          window.location.href = ROUTES.AUTH.LOGIN
          break;
        case 403:
          message.error('You do not have permission to perform this action');
          break;
        case 404:
          message.error('Resource not found');
          break;
        case 500:
          message.error('Internal server error. Please try again later.');
          break;
        default:
          message.error(data.message || 'An error occurred');
      }
    } else if (error.request) {
      // Request made but no response
      message.error('Network error. Please check your connection.');
    } else {
      // Something else happened
      message.error('An unexpected error occurred');
    }
  }

  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  async patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }

  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }
}

export const httpService = new HttpService();
