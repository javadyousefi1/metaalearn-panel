import { Permission, User, UserRole } from '@/types';

/**
 * Check if user has a specific permission
 */
export const hasPermission = (
  user: User | null,
  permission: Permission | Permission[]
): boolean => {
  if (!user) return false;

  // Super admin has all permissions
  if (user.role === UserRole.SUPER_ADMIN) return true;

  const permissions = Array.isArray(permission) ? permission : [permission];

  return permissions.some((p) => user.permissions.includes(p));
};

/**
 * Check if user has ANY of the specified permissions
 */
export const hasAnyPermission = (
  user: User | null,
  permissions: Permission[]
): boolean => {
  if (!user) return false;
  if (user.role === UserRole.SUPER_ADMIN) return true;

  return permissions.some((p) => user.permissions.includes(p));
};

/**
 * Check if user has ALL of the specified permissions
 */
export const hasAllPermissions = (
  user: User | null,
  permissions: Permission[]
): boolean => {
  if (!user) return false;
  if (user.role === UserRole.SUPER_ADMIN) return true;

  return permissions.every((p) => user.permissions.includes(p));
};

/**
 * Check if user has a specific role
 */
export const hasRole = (user: User | null, role: UserRole | UserRole[]): boolean => {
  if (!user) return false;

  const roles = Array.isArray(role) ? role : [role];
  return roles.includes(user.role);
};

/**
 * Get role hierarchy level (higher number = more permissions)
 */
export const getRoleLevel = (role: UserRole): number => {
  const roleLevels: Record<UserRole, number> = {
    [UserRole.SUPER_ADMIN]: 5,
    [UserRole.ADMIN]: 4,
    [UserRole.MODERATOR]: 3,
    [UserRole.TEACHER]: 2,
    [UserRole.STUDENT]: 1,
  };

  return roleLevels[role] || 0;
};

/**
 * Check if user's role is higher than the specified role
 */
export const isRoleHigherThan = (
  user: User | null,
  role: UserRole
): boolean => {
  if (!user) return false;
  return getRoleLevel(user.role) > getRoleLevel(role);
};
