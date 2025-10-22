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
      message.success(response.message || 'OTP sent to your phone!');
      return response;
    } catch (error) {
      message.error('Failed to send OTP. Please check your phone number.');
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
      message.success('Login successful!');
      navigate(ROUTES.DASHBOARD.OVERVIEW);
    } catch (error) {
      message.error('Invalid code. Please try again.');
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
      message.success(response.message || 'OTP resent successfully!');
      return response;
    } catch (error) {
      message.error('Failed to resend OTP. Please try again.');
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
      message.success('Logged out successfully');
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
      message.success('Registration successful!');
      navigate(ROUTES.DASHBOARD.OVERVIEW);
    } catch (error) {
      message.error('Registration failed. Please try again.');
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
