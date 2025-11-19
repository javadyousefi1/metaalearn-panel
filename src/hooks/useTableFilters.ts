import { useState, useCallback } from 'react';

/**
 * Generic filter value type - can be string, number, array, or any other value
 */
export type FilterValue = string | number | boolean | string[] | number[] | null | undefined;

/**
 * Filter state structure - key-value pairs of filter names and their values
 */
export interface FilterState {
  [key: string]: FilterValue;
}

/**
 * Return type for the useTableFilters hook
 */
export interface UseTableFiltersReturn {
  filters: FilterState;
  setFilter: (key: string, value: FilterValue) => void;
  removeFilter: (key: string) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
}

/**
 * A reusable hook for managing table filters
 *
 * This hook provides a clean interface for managing filter state with proper
 * separation of concerns. It handles filter updates, removals, and clearing.
 *
 * @param initialFilters - Optional initial filter state
 * @returns Filter state and control functions
 *
 * @example
 * const { filters, setFilter, clearFilters, hasActiveFilters } = useTableFilters({
 *   status: 'active',
 * });
 *
 * // Set a filter
 * setFilter('identityStatus', IdentityStatusType.Verified);
 *
 * // Remove a filter
 * removeFilter('identityStatus');
 *
 * // Clear all filters
 * clearFilters();
 */
export function useTableFilters(initialFilters: FilterState = {}): UseTableFiltersReturn {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  /**
   * Set or update a single filter
   */
  const setFilter = useCallback((key: string, value: FilterValue) => {
    setFilters((prev) => {
      // If value is null or undefined, remove the filter
      if (value === null || value === undefined) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }

      // Otherwise, update the filter
      return {
        ...prev,
        [key]: value,
      };
    });
  }, []);

  /**
   * Remove a specific filter
   */
  const removeFilter = useCallback((key: string) => {
    setFilters((prev) => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  /**
   * Check if there are any active filters
   */
  const hasActiveFilters = Object.keys(filters).length > 0;

  /**
   * Count of active filters
   */
  const activeFilterCount = Object.keys(filters).length;

  return {
    filters,
    setFilter,
    removeFilter,
    clearFilters,
    hasActiveFilters,
    activeFilterCount,
  };
}
