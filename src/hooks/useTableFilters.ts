import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

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
  handleTableChange: (filterMap: Record<string, string>) => (pagination: any, tableFilters: any) => void;
}

/**
 * Parse a URL search param value to appropriate type
 */
function parseParamValue(value: string | null): FilterValue {
  if (value === null || value === '') return null;

  // Try to parse as number
  const num = Number(value);
  if (!isNaN(num)) return num;

  // Try to parse as boolean
  if (value === 'true') return true;
  if (value === 'false') return false;

  // Return as string
  return value;
}

/**
 * Serialize a filter value to string for URL
 */
function serializeParamValue(value: FilterValue): string | null {
  if (value === null || value === undefined) return null;
  if (Array.isArray(value)) return value.join(',');
  return String(value);
}

/**
 * A reusable hook for managing table filters
 *
 * This hook provides a clean interface for managing filter state with proper
 * separation of concerns. It handles filter updates, removals, and clearing.
 * Filters are automatically synced with URL query parameters.
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
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize filters from URL on mount
  const getInitialFilters = useCallback((): FilterState => {
    const urlFilters: FilterState = {};

    // Get all params except pagination params
    searchParams.forEach((value, key) => {
      if (key !== 'pageIndex' && key !== 'pageSize') {
        urlFilters[key] = parseParamValue(value);
      }
    });

    // Merge URL filters with initial filters (URL takes precedence)
    return { ...initialFilters, ...urlFilters };
  }, []);

  const [filters, setFilters] = useState<FilterState>(getInitialFilters);

  // Sync filters to URL whenever they change
  useEffect(() => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);

      // Preserve pagination params
      const pageIndex = newParams.get('pageIndex');
      const pageSize = newParams.get('pageSize');

      // Clear all non-pagination params
      Array.from(newParams.keys()).forEach((key) => {
        if (key !== 'pageIndex' && key !== 'pageSize') {
          newParams.delete(key);
        }
      });

      // Add current filters
      Object.entries(filters).forEach(([key, value]) => {
        const serialized = serializeParamValue(value);
        if (serialized !== null) {
          newParams.set(key, serialized);
        }
      });

      return newParams;
    }, { replace: true });
  }, [filters, setSearchParams]);

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
   * Create a table onChange handler
   * Maps column keys to filter parameter names
   */
  const handleTableChange = useCallback((filterMap: Record<string, string>) => {
    return (_pagination: any, tableFilters: any) => {
      Object.entries(filterMap).forEach(([columnKey, filterKey]) => {
        const value = tableFilters[columnKey];
        setFilter(filterKey, value && value.length > 0 ? value[0] : null);
      });
    };
  }, [setFilter]);

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
    handleTableChange,
  };
}
