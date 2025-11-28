import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import faIR from 'antd/locale/fa_IR';
import { queryClient } from '@/config';
import { router } from '@/router';
import { useAuthStore } from '@/store';
import { useUser } from '@/hooks';
import { FullScreenLoader } from '@/components/common';

/**
 * Auth Checker Component
 * Handles user profile fetching with React Query
 */
const AuthChecker = ({ children }: { children: React.ReactNode }) => {
  const { token, isAuthenticated, user } = useAuthStore();
  const { isLoading, isFetching } = useUser();

  // Show loader when:
  // 1. User has token and is authenticated
  // 2. No user data loaded yet
  // 3. React Query is loading or fetching
  const shouldShowLoader = token && isAuthenticated && !user && (isLoading || isFetching);

  if (shouldShowLoader) {
    return <FullScreenLoader />;
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
        <AuthChecker>
          <RouterProvider router={router} />
        </AuthChecker>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;
