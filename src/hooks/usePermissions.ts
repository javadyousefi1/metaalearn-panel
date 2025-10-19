import { useAuthStore } from '@/store';
import { Permission, UserRole } from '@/types';
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasRole,
  isRoleHigherThan,
} from '@/utils';

/**
 * usePermissions Hook
 * Provides permission checking utilities
 */
export const usePermissions = () => {
  const { user } = useAuthStore();

  return {
    /**
     * Check if user has a specific permission
     */
    can: (permission: Permission | Permission[]): boolean => {
      return hasPermission(user, permission);
    },

    /**
     * Check if user has ANY of the specified permissions
     */
    canAny: (permissions: Permission[]): boolean => {
      return hasAnyPermission(user, permissions);
    },

    /**
     * Check if user has ALL of the specified permissions
     */
    canAll: (permissions: Permission[]): boolean => {
      return hasAllPermissions(user, permissions);
    },

    /**
     * Check if user has a specific role
     */
    isRole: (role: UserRole | UserRole[]): boolean => {
      return hasRole(user, role);
    },

    /**
     * Check if user's role is higher than specified role
     */
    isRoleAbove: (role: UserRole): boolean => {
      return isRoleHigherThan(user, role);
    },

    /**
     * Check if user is super admin
     */
    isSuperAdmin: (): boolean => {
      return hasRole(user, UserRole.SUPER_ADMIN);
    },

    /**
     * Check if user is admin or higher
     */
    isAdmin: (): boolean => {
      return hasRole(user, [UserRole.SUPER_ADMIN, UserRole.ADMIN]);
    },
  };
};
