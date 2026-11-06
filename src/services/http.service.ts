import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { env } from '@/config';
import { message } from 'antd';
import { isPublicAuthPath } from '@/constants/authPaths';
import { installSessionRefresh } from '@/lib/sessionRefresh';
import { cookieUtils } from '@/lib/cookies';
import { expireSession } from '@/lib/sessionSync';

interface BackendError {
  code: string;
  description: string;
  type: number;
}

export const NOT_STAFF_ERROR_CODE = 'Users.NotStaff';
export const NOT_STAFF_MESSAGE = 'این حساب کاربری دسترسی به پنل مدیریت ندارد.';

interface BackendErrorResponse {
  code?: string;
  extensions?: { code?: string };
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  errors?: BackendError[];
  traceId?: string;
  message?: string;
}

/** True when the error is the backend's "Users.NotStaff" ProblemDetails (status 400/403). */
export const isNotStaffError = (error: unknown): boolean => {
  if (!axios.isAxiosError(error)) return false;
  const data = error.response?.data as BackendErrorResponse | undefined;
  if (!data) return false;
  return (
    data.code === NOT_STAFF_ERROR_CODE ||
    data.extensions?.code === NOT_STAFF_ERROR_CODE ||
    !!data.errors?.some((err) => err.code === NOT_STAFF_ERROR_CODE)
  );
};

const getStoredToken = (): string | null => cookieUtils.getAccessToken() ?? null;

const getStoredRefreshToken = (): string | null => cookieUtils.getRefreshToken() ?? null;

export const clearStoredTokens = () => {
  cookieUtils.removeTokens();
};

/**
 * True only for the current-user profile call (userService.getUserProfile):
 * exact path `/User/Get` and no target-user id param. getUserWithInvoices uses
 * the same path with `userId`, so it must not match.
 */
const isCurrentUserProfileRequest = (config?: AxiosRequestConfig): boolean => {
  const url = config?.url;
  if (!url || url.includes('?')) return false;
  const path = `/${url.replace(/^\/+/, '')}`;
  if (path.toLowerCase() !== '/user/get') return false;
  const params = config?.params as Record<string, unknown> | undefined;
  return !params || (params.userId == null && params.id == null);
};

class HttpService {
  private client: AxiosInstance;
  /** Refresh tokens are always issued by Web.Api, not Streamer/Worker. */
  private readonly tokenRefreshBaseUrl: string;

  constructor(baseURL: string, options?: { tokenRefreshBaseUrl?: string }) {
    this.tokenRefreshBaseUrl = options?.tokenRefreshBaseUrl ?? baseURL;
    this.client = axios.create({
      baseURL,
      timeout: env.apiTimeout,
      headers: {
        'Back-Office': 'true',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      (config) => {
        const token = getStoredToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    installSessionRefresh([this.client], {
      lockName: 'metaalearn-backoffice-session-refresh',
      getToken: getStoredToken,
      getSessionMarker: getStoredRefreshToken,
      refresh: async (token) => {
        const response = await axios.post<{ token: string; refreshToken: string | null }>(
          `${this.tokenRefreshBaseUrl.replace(/\/$/, '')}/Authentication/RefreshToken`,
          { token, refreshToken: getStoredRefreshToken() },
          {
            timeout: env.apiTimeout,
            headers: { 'Back-Office': 'true' },
          },
        );
        return { token: response.data.token, refreshToken: response.data.refreshToken };
      },
      replaceTokens: ({ token, refreshToken }) => {
        if (refreshToken) cookieUtils.setTokens(token, refreshToken);
        else cookieUtils.setAccessToken(token);
      },
      discardTokens: clearStoredTokens,
      expireSession,
      isPublicAuthPath,
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 404 && isCurrentUserProfileRequest(error.config)) {
          expireSession();
          return Promise.reject(error);
        }

        this.handleError(error);
        return Promise.reject(error);
      },
    );
  }

  private extractErrorMessage(data: BackendErrorResponse): string {
    if (data.errors && data.errors.length > 0) {
      const errorDescriptions = data.errors
        .map((err) => err.description)
        .filter((desc) => desc && desc.trim() !== '');

      if (errorDescriptions.length > 0) {
        return errorDescriptions.length === 1
          ? errorDescriptions[0]
          : errorDescriptions.map((desc, idx) => `${idx + 1}. ${desc}`).join('\n');
      }
    }

    if (data.detail) return data.detail;
    if (data.title) return data.title;
    if (data.message) return data.message;
    return 'خطایی رخ داده است';
  }

  private handleError(error: AxiosError): void {
    console.error(error);
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as BackendErrorResponse;

      if (status === 404 && isCurrentUserProfileRequest(error.config)) {
        return;
      }

      if (isNotStaffError(error)) {
        message.error(NOT_STAFF_MESSAGE);
        return;
      }

      const errorMessage = this.extractErrorMessage(data);
      console.log(errorMessage, 'errorMessage');
      switch (status) {
        case 400:
          message.error(errorMessage);
          break;
        case 401:
          message.error('دسترسی غیرمجاز. لطفاً دوباره وارد شوید');
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
      message.error('خطای شبکه. لطفاً اتصال اینترنت خود را بررسی کنید');
    } else {
      message.error('خطای غیرمنتظره‌ای رخ داد');
    }
  }

  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  async patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }

  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }
}

export const httpService = new HttpService(env.apiBaseUrl);
export const streamerHttpService = new HttpService(env.videoApiBaseUrl, {
  tokenRefreshBaseUrl: env.apiBaseUrl,
});
