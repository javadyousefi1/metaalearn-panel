import { useAuthStore } from '@/store';
import { authService } from '@/services';
import { OtpLoginCredentials, VerifyOtpRequest, ResendOtpRequest } from '@/types';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';

/**
 * useAuth Hook
 * Provides authentication state and methods
 */
export const useAuth = () => {
  const navigate = useNavigate();
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
      navigate(ROUTES.DASHBOARD.OVERVIEW);
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
  const logout = async () => {
    try {
      await authService.logout();
      clearAuth();
      message.success('خروج با موفقیت انجام شد');
      navigate(ROUTES.AUTH.LOGIN);
    } catch (error) {
      // Clear auth even if logout API fails
      clearAuth();
      navigate(ROUTES.AUTH.LOGIN);
    }
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
      navigate(ROUTES.DASHBOARD.OVERVIEW);
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
