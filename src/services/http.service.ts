import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { env } from '@/config';
import { useAuthStore } from '@/store';
import { message } from 'antd';
import {ROUTES} from "@/constants";

/**
 * Backend Error Response Structure
 */
interface BackendError {
  code: string;
  description: string;
  type: number;
}

interface BackendErrorResponse {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  errors?: BackendError[];
  traceId?: string;
  message?: string; // Fallback for simple error messages
}

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
        'Back-Office' : 'true'
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

  /**
   * Extract and format error message from backend response
   */
  private extractErrorMessage(data: BackendErrorResponse): string {
    // Priority 1: Extract from errors array
    if (data.errors && data.errors.length > 0) {
      const errorDescriptions = data.errors
        .map((err) => err.description)
        .filter((desc) => desc && desc.trim() !== '');

      if (errorDescriptions.length > 0) {
        // Join multiple errors with a bullet point
        return errorDescriptions.length === 1
          ? errorDescriptions[0]
          : errorDescriptions.map((desc, idx) => `${idx + 1}. ${desc}`).join('\n');
      }
    }

    // Priority 2: Use detail field
    if (data.detail) {
      return data.detail;
    }

    // Priority 3: Use title field
    if (data.title) {
      return data.title;
    }

    // Priority 4: Use message field (fallback)
    if (data.message) {
      return data.message;
    }

    // Fallback message
    return 'خطایی رخ داده است';
  }

  private handleError(error: AxiosError): void {
    if (error.response) {
      // Server responded with error
      const status = error.response.status;
      const data = error.response.data as BackendErrorResponse;


      // Extract formatted error message
      const errorMessage = this.extractErrorMessage(data);
        console.log(errorMessage ,"errorMessage")
      switch (status) {
        case 400:
          message.error(errorMessage);
          break;
        case 401:
          message.error('دسترسی غیرمجاز. لطفاً دوباره وارد شوید');
          window.location.href = ROUTES.AUTH.LOGIN;
          break;
        case 403:
          message.error('شما اجازه انجام این عملیات را ندارید');
          break;
        case 404:
          message.error(errorMessage || 'منبع مورد نظر یافت نشد');
          break;
        case 500:
          message.error(errorMessage || 'خطای سرور. لطفاً بعداً تلاش کنید');
          break;
        default:
          message.error(errorMessage);
      }
    } else if (error.request) {
      // Request made but no response
      message.error('خطای شبکه. لطفاً اتصال اینترنت خود را بررسی کنید');
    } else {
      // Something else happened
      message.error('خطای غیرمنتظره‌ای رخ داد');
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
