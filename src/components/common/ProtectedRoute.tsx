import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { Permission } from '@/types';
import { hasPermission } from '@/utils';
import { ROUTES } from '@/constants';
import { Spin } from 'antd';

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
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (isAuthenticated && isLoading) {
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

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.AUTH.LOGIN} state={{ from: location }} replace />;
  }

  // // Check permissions if specified
  // if (permissions && permissions.length > 0 && user) {
  //   const hasRequiredPermissions = requireAll
  //     ? permissions.every((permission) => hasPermission(user, permission))
  //     : permissions.some((permission) => hasPermission(user, permission));
  //
  //   if (!hasRequiredPermissions) {
  //     return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  //   }
  // }

  return <>{children}</>;
};
