import { useAuthStore } from '@/store';
import { authService } from '@/services';
import { OtpLoginCredentials, VerifyOtpRequest, ResendOtpRequest } from '@/types';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { useQueryClient } from '@tanstack/react-query';

/**
 * useAuth Hook
 * Provides authentication state and methods
 */
export const useAuth = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, token, isAuthenticated, isLoading, setAuth, clearAuth, setLoading } = useAuthStore();

  /**
   * Login user - Send OTP
   */
  const login = async (credentials: OtpLoginCredentials) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);
      message.success(response.message || 'کد به شماره شما ارسال شد!');
      return response;
    } catch (error) {
      message.error('ارسال کد ناموفق بود. لطفا شماره تلفن خود را بررسی کنید.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verify OTP
   */
  const verifyOtp = async (data: VerifyOtpRequest) => {
    try {
      setLoading(true);
      const response = await authService.verifyOtp(data);
      setAuth(response.user, response.token, response.refreshToken);
      message.success('ورود موفقیت‌آمیز بود!');
      navigate(ROUTES.USERS.ROOT);
    } catch (error) {
      message.error('کد نامعتبر است. لطفا دوباره تلاش کنید.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Resend OTP
   */
  const resendOtp = async (data: ResendOtpRequest) => {
    try {
      setLoading(true);
      const response = await authService.resendOtp(data);
      message.success(response.message || 'کد مجددا ارسال شد!');
      return response;
    } catch (error) {
      message.error('ارسال مجدد کد ناموفق بود. لطفا دوباره تلاش کنید.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout user
   */
  const logout = () => {
    // Clear auth from Zustand store (this also clears localStorage via persist middleware)
    clearAuth();

    // Clear all React Query cache
    queryClient.clear();

    // Show success message
    message.success('خروج با موفقیت انجام شد');

    // Navigate to login page
    navigate(ROUTES.AUTH.LOGIN);
  };

  /**
   * Register new user
   */
  const register = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    try {
      setLoading(true);
      const response = await authService.register(data);
      setAuth(response.user, response.token, response.refreshToken);
      message.success('ثبت نام با موفقیت انجام شد!');
      navigate(ROUTES.USERS.ROOT);
    } catch (error) {
      message.error('ثبت نام ناموفق بود. لطفا دوباره تلاش کنید.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    verifyOtp,
    resendOtp,
    logout,
    register,
  };
};
