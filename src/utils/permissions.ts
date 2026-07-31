import { Permission, User, UserRole } from '@/types';

const getUserRoles = (user: User | null): string[] => {
  if (!user) return [];

  if (Array.isArray(user.info?.roles) && user.info.roles.length > 0) {
    return user.info.roles;
  }

  const rootRoles = (user as User & { roles?: string[] }).roles;
  return Array.isArray(rootRoles) ? rootRoles : [];
};

export const isSuperAdminUser = (user: User | null): boolean =>
  getUserRoles(user).includes(UserRole.SUPER_ADMIN);

/**
 * Check if user has a specific permission
 */
export const hasPermission = (
  user: User | null,
  permission: Permission | Permission[]
): boolean => {
  if (!user) return false;

  if (isSuperAdminUser(user)) return true;

  const permissions = Array.isArray(permission) ? permission : [permission];
  const userPermissions = (user as User & { permissions?: Permission[] }).permissions ?? [];

  return permissions.some((p) => userPermissions.includes(p));
};

/**
 * Check if user has ANY of the specified permissions
 */
export const hasAnyPermission = (
  user: User | null,
  permissions: Permission[]
): boolean => {
  if (!user) return false;
  if (isSuperAdminUser(user)) return true;

  const userPermissions = (user as User & { permissions?: Permission[] }).permissions ?? [];
  return permissions.some((p) => userPermissions.includes(p));
};

/**
 * Check if user has ALL of the specified permissions
 */
export const hasAllPermissions = (
  user: User | null,
  permissions: Permission[]
): boolean => {
  if (!user) return false;
  if (isSuperAdminUser(user)) return true;

  const userPermissions = (user as User & { permissions?: Permission[] }).permissions ?? [];
  return permissions.every((p) => userPermissions.includes(p));
};

/**
 * Check if user has a specific role
 */
export const hasRole = (user: User | null, role: UserRole | UserRole[]): boolean => {
  if (!user) return false;

  const userRoles = getUserRoles(user);
  const roles = Array.isArray(role) ? role : [role];
  return roles.some((r) => userRoles.includes(r));
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

  const userRoles = getUserRoles(user);
  const highestUserLevel = Math.max(...userRoles.map((r) => getRoleLevel(r as UserRole)), 0);
  return highestUserLevel > getRoleLevel(role);
};
