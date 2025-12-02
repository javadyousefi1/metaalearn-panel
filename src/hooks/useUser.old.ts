import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services';
import { useAuthStore } from '@/store';
import { QUERY_KEYS } from '@/constants';

/**
 * useUser Hook
 * Fetches and caches user profile data using React Query
 */
export const useUser = () => {
  const { token, isAuthenticated, setAuth } = useAuthStore();

  const query = useQuery({
    queryKey: QUERY_KEYS.USER.PROFILE,
    queryFn: async () => {
      const userData = await userService.getUserProfile();
      // Update user data in store after fetching
      const currentState = useAuthStore.getState();
      console.log(userData);
      if (currentState.token && currentState.refreshToken) {
        setAuth(userData, currentState.token, currentState.refreshToken);
      }
      return userData;
    },
    enabled: !!token && isAuthenticated, // Only fetch if user has token
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: false, // Don't retry on error (401 will redirect to login)
  });

  return query;
};
