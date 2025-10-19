import { ReactNode } from 'react';
import { usePermissions } from '@/hooks';
import { Permission } from '@/types';

interface PermissionGuardProps {
  children: ReactNode;
  permissions: Permission | Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
}

/**
 * PermissionGuard Component
 * Conditionally renders children based on user permissions
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permissions,
  requireAll = false,
  fallback = null,
}) => {
  const { can, canAll } = usePermissions();

  const hasRequiredPermissions = requireAll
    ? canAll(Array.isArray(permissions) ? permissions : [permissions])
    : can(permissions);

  if (!hasRequiredPermissions) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
