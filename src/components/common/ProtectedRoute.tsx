import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { Permission } from '@/types';
import { hasPermission } from '@/utils';
import { ROUTES } from '@/constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
  permissions?: Permission[];
  requireAll?: boolean;
}

/**
 * ProtectedRoute Component
 * Wraps routes that require authentication and/or specific permissions
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  permissions,
  requireAll = false,
}) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.AUTH.LOGIN} state={{ from: location }} replace />;
  }

  // Check permissions if specified
  if (permissions && permissions.length > 0) {
    const hasRequiredPermissions = requireAll
      ? permissions.every((permission) => hasPermission(user, permission))
      : permissions.some((permission) => hasPermission(user, permission));

    if (!hasRequiredPermissions) {
      return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
    }
  }

  return <>{children}</>;
};
