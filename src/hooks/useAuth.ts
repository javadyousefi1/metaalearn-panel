import { useAuthStore } from '@/store';
import { authService } from '@/services';
import { LoginCredentials } from '@/types';
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
   * Login user
   */
  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);
      setAuth(response.user, response.token, response.refreshToken);
      message.success('Login successful!');
      navigate(ROUTES.DASHBOARD.OVERVIEW);
    } catch (error) {
      message.error('Login failed. Please check your credentials.');
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
    logout,
    register,
  };
};
