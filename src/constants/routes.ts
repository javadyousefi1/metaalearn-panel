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
    COURSE_LIST: '/courses/course-list',
    CATEGORIES: {
      ROOT: '/courses/categories',
      SUB: (id:string) => '/courses/categories/:id'.replace(":id" , id),
    },
  },

  // Course Detail Routes
  COURSE: {
    ROOT: (id: string) => `/course/${id}`,
    DETAIL: '/course/:id',
    INTRODUCTION: (id: string) => `/course/${id}/introduction`,
    INTRODUCTION_PATH: '/course/:id/introduction',
    FAQ: (id: string) => `/course/${id}/faq`,
    FAQ_PATH: '/course/:id/faq',
    SESSIONS: (id: string) => `/course/${id}/sessions`,
    SESSIONS_PATH: '/course/:id/sessions',
    SCHEDULES: (id: string) => `/course/${id}/schedules`,
    SCHEDULES_PATH: '/course/:id/schedules',
    GALLERY: (id: string) => `/course/${id}/gallery`,
    GALLERY_PATH: '/course/:id/gallery',
    COMMENTS: (id: string) => `/course/${id}/comments`,
    COMMENTS_PATH: '/course/:id/comments',
  },


  // Tickets Routes
  TICKETS: {
    ROOT: '/tickets',
    LIST: '/tickets',
    DETAIL: (id: string) => `/tickets/${id}`,
    DETAIL_PATH: '/tickets/:id',
  },

  // Operators Routes (Course Tickets)
  OPERATORS: {
    ROOT: '/operators',
    LIST: '/operators',
    DETAIL: (id: string) => `/operators/${id}`,
    DETAIL_PATH: '/operators/:id',
    PRACTICES: '/operators/practices',
    PRACTICE_DETAIL: (courseId: string) => `/operators/practices/${courseId}`,
    PRACTICE_DETAIL_PATH: '/operators/practices/:courseId',
  },

  // Finance Routes
  FINANCE: {
    ROOT: '/finance',
    CREDIT_CARDS: '/finance/credit-cards',
    PAYMENT_INSTRUCTIONS: '/finance/payment-instructions',
    TRANSACTIONS: '/finance/transactions',
  },

  // Blog Routes
  BLOGS: {
    ROOT: '/blogs',
    LIST: '/blogs',
    CREATE: '/blogs/create',
    CREATE_INFO: '/blogs/create/info',
    CATEGORIES: '/blogs/categories',
  },

  // Blog Detail Routes
  BLOG: {
    ROOT: (id: string) => `/blogs/${id}`,
    DETAIL: '/blogs/:id',
    INFO: (id: string) => `/blogs/${id}/info`,
    INFO_PATH: '/blogs/:id/info',
    GALLERY: (id: string) => `/blogs/${id}/gallery`,
    GALLERY_PATH: '/blogs/:id/gallery',
  },

  // Notifications Routes
  NOTIFICATIONS: {
    ROOT: '/notifications',
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
  [ROUTES.TICKETS.LIST]: 'تیکت‌ها',
  [ROUTES.OPERATORS.LIST]: 'اپراتورها',
  [ROUTES.OPERATORS.DETAIL_PATH]: 'جزئیات تیکت اپراتور',
  [ROUTES.FINANCE.CREDIT_CARDS]: 'کارت‌های بانکی',
  [ROUTES.FINANCE.PAYMENT_INSTRUCTIONS]: 'کارت ها',
  [ROUTES.FINANCE.TRANSACTIONS]: 'تاریخچه تراکنش‌ها',
  [ROUTES.COURSES.COURSE_LIST]: 'لیست دوره‌ها',
  [ROUTES.COURSES.CATEGORIES.ROOT]: 'مدیریت دسته‌بندی‌ها',
  [ROUTES.COURSE.DETAIL]: 'جزئیات دوره',
  [ROUTES.COURSE.INTRODUCTION_PATH]: 'معرفی دوره',
  [ROUTES.COURSE.FAQ_PATH]: 'سوالات متداول',
  [ROUTES.COURSE.SCHEDULES_PATH]: 'گروه‌بندی',
  [ROUTES.COURSE.GALLERY_PATH]: 'گالری دوره',
  [ROUTES.COURSE.COMMENTS_PATH]: 'کامنت‌ها',
  [ROUTES.BLOGS.LIST]: 'لیست مقالات',
  [ROUTES.BLOGS.CATEGORIES]: 'دسته‌بندی‌های مقالات',
  [ROUTES.BLOGS.CREATE]: 'ایجاد مقاله جدید',
  [ROUTES.BLOG.DETAIL]: 'جزئیات مقاله',
  [ROUTES.BLOG.INFO_PATH]: 'اطلاعات مقاله',
  [ROUTES.BLOG.GALLERY_PATH]: 'گالری مقاله',
  [ROUTES.NOTIFICATIONS.ROOT]: 'اعلانات',
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
