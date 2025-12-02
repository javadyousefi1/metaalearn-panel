import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider, useQuery } from '@tanstack/react-query';
import { ConfigProvider, Spin } from 'antd';
import faIR from 'antd/locale/fa_IR';
import { queryClient } from '@/config';
import { router } from '@/router';
import { QUERY_KEYS } from '@/constants';
import { userService } from '@/services';

/**
 * Auth Loader Component
 * Fetches user data on app load if token exists
 */
const AuthLoader = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('auth_token');

  // Only fetch user if token exists
  const { isLoading } = useQuery({
    queryKey: QUERY_KEYS.USER.PROFILE,
    queryFn: userService.getUserProfile,
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  // Show loader only if we have a token and are fetching user data
  if (token && isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return <>{children}</>;
};

/**
 * Main App Component
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        locale={faIR}
        direction="rtl"
        theme={{
          token: {
            colorPrimary: '#4B26AD',
            borderRadius: 8,
            fontFamily: 'IRANYekanX, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial',
          },
        }}
      >
        <AuthLoader>
          <RouterProvider router={router} />
        </AuthLoader>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;
