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
  },
} as const;
