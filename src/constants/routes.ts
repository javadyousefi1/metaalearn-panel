/**
 * Route Constants
 * All route paths are defined here as constants for type safety and easy maintenance
 */

export const ROUTES = {
  // Auth Routes
  AUTH: {
    ROOT: '/auth',
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },

  // Dashboard Routes
  DASHBOARD: {
    ROOT: '/',
    OVERVIEW: '/dashboard',
    ANALYTICS: '/dashboard/analytics',
  },

  // User Management Routes
  USERS: {
    ROOT: '/users',
    LIST: '/users',
    CREATE: '/users/create',
    EDIT: '/users/:id/edit',
    VIEW: '/users/:id',
  },

  // Course Management Routes
  COURSES: {
    ROOT: '/courses',
    LIST: '/courses',
    CREATE: '/courses/create',
    EDIT: '/courses/:id/edit',
    VIEW: '/courses/:id',
  },

  // Settings Routes
  SETTINGS: {
    ROOT: '/settings',
    PROFILE: '/settings/profile',
    ACCOUNT: '/settings/account',
    SECURITY: '/settings/security',
    PREFERENCES: '/settings/preferences',
  },

  // Other Routes
  NOT_FOUND: '/404',
  UNAUTHORIZED: '/401',
} as const;

/**
 * Helper function to generate dynamic routes
 */
export const generatePath = (path: string, params: Record<string, string | number>): string => {
  let result = path;
  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(`:${key}`, String(value));
  });
  return result;
};

/**
 * Page Titles - Maps route paths to page titles
 */
export const PAGE_TITLES: Record<string, string> = {
  [ROUTES.DASHBOARD.OVERVIEW]: 'Dashboard',
  [ROUTES.DASHBOARD.ANALYTICS]: 'Analytics',
  [ROUTES.USERS.LIST]: 'Users Management',
  [ROUTES.USERS.CREATE]: 'Create User',
  [ROUTES.USERS.EDIT]: 'Edit User',
  [ROUTES.USERS.VIEW]: 'User Details',
  [ROUTES.COURSES.LIST]: 'Courses Management',
  [ROUTES.COURSES.CREATE]: 'Create Course',
  [ROUTES.COURSES.EDIT]: 'Edit Course',
  [ROUTES.COURSES.VIEW]: 'Course Details',
  [ROUTES.SETTINGS.PROFILE]: 'Profile Settings',
  [ROUTES.SETTINGS.ACCOUNT]: 'Account Settings',
  [ROUTES.SETTINGS.SECURITY]: 'Security Settings',
  [ROUTES.SETTINGS.PREFERENCES]: 'Preferences',
  [ROUTES.AUTH.LOGIN]: 'Login',
  [ROUTES.AUTH.REGISTER]: 'Register',
  [ROUTES.AUTH.FORGOT_PASSWORD]: 'Forgot Password',
  [ROUTES.NOT_FOUND]: 'Page Not Found',
  [ROUTES.UNAUTHORIZED]: 'Unauthorized',
};
