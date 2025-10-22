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
} as const;
