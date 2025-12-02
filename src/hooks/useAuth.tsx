import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { authService, userService } from '@/services';
import { ROUTES, QUERY_KEYS } from '@/constants';
import { OtpLoginCredentials, VerifyOtpRequest, ResendOtpRequest, User } from '@/types';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

/**
 * Get token from localStorage
 */
const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Get refresh token from localStorage
 */
const getStoredRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Store tokens in localStorage
 */
const storeTokens = (token: string, refreshToken: string) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

/**
 * Clear tokens from localStorage
 */
const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

/**
 * Navigate helper that works outside Router context
 */
const navigateTo = (path: string) => {
  window.location.href = path;
};

/**
 * useAuth Hook - Handles all authentication with React Query
 */
export const useAuth = () => {
  const queryClient = useQueryClient();
  const token = getStoredToken();
  const isAuthenticated = !!token;

  // Fetch user profile
  const {
    data: user,
    isLoading,
    isFetching,
    error,
  } = useQuery<User>({
    queryKey: QUERY_KEYS.USER.PROFILE,
    queryFn: userService.getUserProfile,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
    console.log(user ,"javad user")
  // Login mutation (send OTP)
  const loginMutation = useMutation({
    mutationFn: (credentials: OtpLoginCredentials) => authService.login(credentials),
    onSuccess: (response) => {
      message.success(response.message || 'کد به شماره شما ارسال شد!');
    },
    onError: () => {
      message.error('ارسال کد ناموفق بود. لطفا شماره تلفن خود را بررسی کنید.');
    },
  });

  // Verify OTP mutation
  const verifyOtpMutation = useMutation({
    mutationFn: (data: VerifyOtpRequest) => authService.verifyOtp(data),
    onSuccess: (response) => {
      // Store tokens
      storeTokens(response.token, response.refreshToken);

      // Invalidate and refetch user profile
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER.PROFILE });

      message.success('ورود موفقیت‌آمیز بود!');
      navigateTo(ROUTES.USERS.ROOT);
    },
    onError: () => {
      message.error('کد نامعتبر است. لطفا دوباره تلاش کنید.');
    },
  });

  // Resend OTP mutation
  const resendOtpMutation = useMutation({
    mutationFn: (data: ResendOtpRequest) => authService.resendOtp(data),
    onSuccess: (response) => {
      message.success(response.message || 'کد مجددا ارسال شد!');
    },
    onError: () => {
      message.error('ارسال مجدد کد ناموفق بود. لطفا دوباره تلاش کنید.');
    },
  });

  // Logout function
  const logout = () => {
    // Clear tokens
    clearTokens();

    // Clear all React Query cache
    queryClient.clear();

    // Show success message
    message.success('خروج با موفقیت انجام شد');

    // Navigate to login page
    navigateTo(ROUTES.AUTH.LOGIN);
  };

  return {
    // User data
    user,
    token,
    isAuthenticated,
    isLoading: isLoading || isFetching,

    // Auth methods
    login: loginMutation.mutateAsync,
    verifyOtp: verifyOtpMutation.mutateAsync,
    resendOtp: resendOtpMutation.mutateAsync,
    logout,

    // Loading states
    isLoggingIn: loginMutation.isPending,
    isVerifying: verifyOtpMutation.isPending,
    isResending: resendOtpMutation.isPending,

    // Error
    error,
  };
};
