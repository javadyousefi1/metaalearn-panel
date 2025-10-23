import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// Generic pagination params interface
export interface TablePaginationParams {
  PageIndex: number;
  PageSize: number;
}

// Generic paginated response interface (matches API structure)
export interface TablePaginatedResponse<T> {
  items: T[];
  totalCount: number;
}

// Hook parameters
export interface UseTableParams<T> {
  queryKey: string | (string | number)[];
  fetchFn: (params: TablePaginationParams) => Promise<TablePaginatedResponse<T>>;
  initialPageIndex?: number;
  initialPageSize?: number;
  enabled?: boolean;
}

// Return type for the hook
export interface UseTableReturn<T> {
  data: T[];
  totalCount: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  pagination: {
    pageIndex: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    setPageIndex: (page: number) => void;
    setPageSize: (size: number) => void;
    nextPage: () => void;
    prevPage: () => void;
    goToFirstPage: () => void;
    goToLastPage: () => void;
  };
  refresh: () => void;
}

/**
 * A reusable custom hook for handling table data with pagination
 *
 * @template T - The type of data items in the table
 * @param {UseTableParams<T>} params - Hook configuration parameters
 * @returns {UseTableReturn<T>} Table data, pagination controls, and loading states
 *
 * @example
 * const { data, isLoading, pagination, refresh } = useTable({
 *   queryKey: 'courses',
 *   fetchFn: courseService.getAll,
 *   initialPageSize: 10,
 * });
 */
export function useTable<T>({
  queryKey,
  fetchFn,
  initialPageIndex = 1,
  initialPageSize = 10,
  enabled = true,
}: UseTableParams<T>): UseTableReturn<T> {
  const [pageIndex, setPageIndex] = useState(initialPageIndex);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Fetch data using React Query
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: Array.isArray(queryKey)
      ? [...queryKey, pageIndex, pageSize]
      : [queryKey, pageIndex, pageSize],
    queryFn: () => fetchFn({ PageIndex: pageIndex, PageSize: pageSize }),
    enabled,
    staleTime: 0, // Always refetch on mount
    refetchOnWindowFocus: false,
  });

  // Calculate pagination metadata
  const totalCount = data?.totalCount ?? 0;
  const totalPages = totalCount > 0 ? Math.ceil(totalCount / pageSize) : 0;
  const hasNextPage = pageIndex < totalPages;
  const hasPrevPage = pageIndex > 1;

  // Pagination control functions
  const handleSetPageSize = (newSize: number) => {
    setPageSize(newSize);
    setPageIndex(1); // Reset to first page when page size changes
  };

  const nextPage = () => {
    if (hasNextPage) {
      setPageIndex((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (hasPrevPage) {
      setPageIndex((prev) => prev - 1);
    }
  };

  const goToFirstPage = () => {
    setPageIndex(1);
  };

  const goToLastPage = () => {
    if (totalPages > 0) {
      setPageIndex(totalPages);
    }
  };

  return {
    data: data?.items ?? [],
    totalCount,
    isLoading,
    isError,
    error: error as Error | null,
    pagination: {
      pageIndex,
      pageSize,
      totalPages,
      hasNextPage,
      hasPrevPage,
      setPageIndex,
      setPageSize: handleSetPageSize,
      nextPage,
      prevPage,
      goToFirstPage,
      goToLastPage,
    },
    refresh: refetch,
  };
}
