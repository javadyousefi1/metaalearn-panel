/**
 * Query Keys Configuration
 *
 * Centralized query keys for React Query
 * Following best practices for query key management
 */

export const queryKeys = {
  categories: {
    all: ['categories'] as const,
    lists: () => [...queryKeys.categories.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.categories.lists(), { ...filters }] as const,
    details: () => [...queryKeys.categories.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.categories.details(), id] as const,
  },
  courses: {
    all: ['courses'] as const,
    lists: () => [...queryKeys.courses.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.courses.lists(), { ...filters }] as const,
    details: () => [...queryKeys.courses.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.courses.details(), id] as const,
  },
  sessions: {
    all: ['sessions'] as const,
    lists: () => [...queryKeys.sessions.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.sessions.lists(), { ...filters }] as const,
    details: () => [...queryKeys.sessions.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.sessions.details(), id] as const,
  },
  schedules: {
    all: ['schedules'] as const,
    lists: () => [...queryKeys.schedules.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.schedules.lists(), { ...filters }] as const,
    details: () => [...queryKeys.schedules.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.schedules.details(), id] as const,
  },
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.users.lists(), { ...filters }] as const,
    byRole: (role: string) => [...queryKeys.users.all, 'role', role] as const,
    purchasedCourses: (courseId: string) => [...queryKeys.users.all, 'purchased', courseId] as const,
  },
  gallery: {
    all: ['gallery'] as const,
    lists: () => [...queryKeys.gallery.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.gallery.lists(), { ...filters }] as const,
    byCourse: (courseId: string) => [...queryKeys.gallery.all, 'course', courseId] as const,
  },
  blogs: {
    all: ['blogs'] as const,
    lists: () => [...queryKeys.blogs.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.blogs.lists(), { ...filters }] as const,
    details: () => [...queryKeys.blogs.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.blogs.details(), id] as const,
  },
  blogCategories: {
    all: ['blogCategories'] as const,
    lists: () => [...queryKeys.blogCategories.all, 'list'] as const,
  },
  blogGallery: {
    all: ['blogGallery'] as const,
    lists: () => [...queryKeys.blogGallery.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.blogGallery.lists(), { ...filters }] as const,
    byBlog: (blogId: string) => [...queryKeys.blogGallery.all, 'blog', blogId] as const,
  },
  courseComments: {
    all: ['courseComments'] as const,
    lists: () => [...queryKeys.courseComments.all, 'list'] as const,
    list: (courseId: string, filters?: Record<string, unknown>) =>
      [...queryKeys.courseComments.lists(), courseId, { ...filters }] as const,
    byCourse: (courseId: string) => [...queryKeys.courseComments.all, 'course', courseId] as const,
  },
  paymentInstructions: {
    all: ['paymentInstructions'] as const,
    lists: () => [...queryKeys.paymentInstructions.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.paymentInstructions.lists(), { ...filters }] as const,
  },
} as const;
