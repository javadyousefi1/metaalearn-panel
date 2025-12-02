import { MenuItemConfig } from '@/types/route.types';

/**
 * Filter menu items based on user roles
 * @param menuItems - Array of menu items to filter
 * @param userRoles - Array of user's roles
 * @returns Filtered menu items that user has access to
 */
export const filterMenuByRoles = (
  menuItems: MenuItemConfig[],
  userRoles: string[] | undefined
): MenuItemConfig[] => {
  console.log('🔍 Filtering menu with user roles:', userRoles);

  if (!userRoles || userRoles.length === 0) {
    console.log('❌ No roles found, returning empty menu');
    return [];
  }

  // Super admin has access to everything
  const isSuperAdmin = userRoles.includes('super-admin');
  console.log('👑 Is super admin?', isSuperAdmin);

  const filtered = menuItems
    .map((item) => {
      // Keep dividers as is
      if (item.divider) {
        return item;
      }

      // If no roles specified, item is accessible to all
      const hasAccess = !item.roles || item.roles.length === 0 || isSuperAdmin || item.roles.some((role) => userRoles.includes(role));

      console.log(`📋 Menu: "${item.label}" | Required roles:`, item.roles, '| Has access?', hasAccess);

      if (!hasAccess) {
        return null;
      }

      // Filter children recursively
      if (item.children && item.children.length > 0) {
        const filteredChildren = filterMenuByRoles(item.children, userRoles);

        console.log(`  └─ Children of "${item.label}":`, filteredChildren.length, 'accessible');

        // If parent has no accessible children, hide parent too
        if (filteredChildren.length === 0) {
          console.log(`  └─ ❌ Hiding "${item.label}" (no accessible children)`);
          return null;
        }

        return {
          ...item,
          children: filteredChildren,
        };
      }

      return item;
    })
    .filter((item): item is MenuItemConfig => item !== null);

  console.log('✅ Final filtered menu items:', filtered.length);
  return filtered;
};

/**
 * Check if user has any of the specified roles
 * @param userRoles - Array of user's roles
 * @param allowedRoles - Array of roles to check against
 * @returns true if user has at least one of the allowed roles
 */
export const hasAnyRole = (
  userRoles: string[] | undefined,
  allowedRoles: string[]
): boolean => {
  if (!userRoles || userRoles.length === 0) {
    return false;
  }

  // Super admin has access to everything
  if (userRoles.includes('super-admin')) {
    return true;
  }

  return allowedRoles.some((role) => userRoles.includes(role));
};
