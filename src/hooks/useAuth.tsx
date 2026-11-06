import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { authService, userService } from '@/services';
import { ROUTES, QUERY_KEYS } from '@/constants';
import { clearStoredTokens, isNotStaffError } from '@/services/http.service';
import { cookieUtils } from '@/lib/cookies';
import { broadcastSessionEnded } from '@/lib/sessionSync';
import { LoginResponse, OtpLoginCredentials, VerifyOtpRequest, ResendOtpRequest, User } from '@/types';

const storeTokens = (token: string, refreshToken?: string | null) => {
  if (refreshToken) cookieUtils.setTokens(token, refreshToken);
  else cookieUtils.setAccessToken(token);
};

const navigateTo = (path: string) => {
  window.location.href = path;
};

export const useAuth = () => {
  const queryClient = useQueryClient();
  const token = cookieUtils.getAccessToken() ?? null;
  const isAuthenticated = cookieUtils.isAuthenticated();

  const {
    data: user,
    isLoading,
    isFetching,
    error,
  } = useQuery<User>({
    queryKey: QUERY_KEYS.USER.PROFILE,
    queryFn: userService.getUserProfile,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: (credentials: OtpLoginCredentials) => authService.login(credentials),
    onSuccess: (response: LoginResponse) => {
      if (response?.token) {
        storeTokens(response.token, response.refreshToken);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER.PROFILE });
        message.success('ورود موفقیت‌آمیز بود!');
        navigateTo(ROUTES.USERS.ROOT);
        return;
      }

      message.success('کد به شماره شما ارسال شد!');
    },
    onError: (error) => {
      // Not-staff and backend-described errors are already toasted by the http interceptor.
      if (isNotStaffError(error)) return;
      message.error('ارسال کد ناموفق بود. لطفا شماره تلفن خود را بررسی کنید.');
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: (data: VerifyOtpRequest) => authService.verifyOtp(data),
    onSuccess: (response) => {
      storeTokens(response.token, response.refreshToken);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER.PROFILE });
      message.success('ورود موفقیت‌آمیز بود!');
      navigateTo(ROUTES.USERS.ROOT);
    },
    onError: (error) => {
      if (isNotStaffError(error)) return;
      message.error('کد نامعتبر است. لطفا دوباره تلاش کنید.');
    },
  });

  const resendOtpMutation = useMutation({
    mutationFn: (data: ResendOtpRequest) => authService.resendOtp(data),
    onSuccess: () => {
      message.success('کد مجددا ارسال شد!');
    },
    onError: () => {
      message.error('ارسال مجدد کد ناموفق بود. لطفا دوباره تلاش کنید.');
    },
  });

  const logout = async () => {
    await authService.logout();
    clearStoredTokens();
    broadcastSessionEnded();
    queryClient.clear();
    message.success('خروج با موفقیت انجام شد');
    navigateTo(ROUTES.AUTH.LOGIN);
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading: isLoading || isFetching,
    login: loginMutation.mutateAsync,
    verifyOtp: verifyOtpMutation.mutateAsync,
    resendOtp: resendOtpMutation.mutateAsync,
    logout,
    isLoggingIn: loginMutation.isPending,
    isVerifying: verifyOtpMutation.isPending,
    isResending: resendOtpMutation.isPending,
    error,
  };
};
