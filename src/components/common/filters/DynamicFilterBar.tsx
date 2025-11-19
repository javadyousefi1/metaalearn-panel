import React from 'react';
import { Button, Space } from 'antd';
import { FilterOutlined, ClearOutlined } from '@ant-design/icons';
import { DynamicFilter } from './DynamicFilter';
import { FilterConfig, FilterValues } from './types';

export interface DynamicFilterBarProps {
  /**
   * Array of filter configurations
   */
  filters: FilterConfig[];

  /**
   * Current filter values
   */
  values: FilterValues;

  /**
   * Callback when a filter value changes
   */
  onChange: (key: string, value: any) => void;

  /**
   * Callback when clear all filters is clicked
   */
  onClearAll?: () => void;

  /**
   * Optional title for the filter bar
   */
  title?: string;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * DynamicFilterBar Component
 *
 * A reusable filter bar that renders filters based on configuration.
 * Eliminates the need to create individual filter components.
 *
 * @example
 * const filters: FilterConfig[] = [
 *   { type: 'text', key: 'name', label: 'نام', icon: User },
 *   { type: 'select', key: 'status', label: 'وضعیت', options: [...] },
 * ];
 *
 * <DynamicFilterBar
 *   filters={filters}
 *   values={filterValues}
 *   onChange={setFilter}
 *   onClearAll={clearFilters}
 * />
 */
export const DynamicFilterBar: React.FC<DynamicFilterBarProps> = ({
  filters,
  values,
  onChange,
  onClearAll,
  title = 'فیلترها',
  className = '',
}) => {
  // Calculate active filter count
  const activeFilterCount = Object.keys(values).filter(
    (key) => values[key] !== null && values[key] !== undefined && values[key] !== ''
  ).length;

  return (
    <div className={`mb-5 ${className}`}>
      <div className="bg-purple-50 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shadow-sm" style={{ backgroundColor: '#4B26AD' }}>
                <FilterOutlined className="text-white text-base" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-800 text-base">{title}</span>
                {activeFilterCount > 0 && (
                  <div className="px-2.5 py-0.5 text-white text-xs font-bold rounded-full shadow-sm" style={{ backgroundColor: '#4B26AD' }}>
                    {activeFilterCount}
                  </div>
                )}
              </div>
            </div>

            {activeFilterCount > 0 && onClearAll && (
              <Button
                type="text"
                size="middle"
                icon={<ClearOutlined />}
                onClick={onClearAll}
                className="text-gray-600 hover:text-red-500 hover:bg-red-50 font-medium transition-all duration-200"
              >
                پاک کردن فیلترها
              </Button>
            )}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg p-4 border border-gray-100">
            <Space wrap size={[16, 16]} className="w-full">
              {filters.map((filterConfig) => (
                <DynamicFilter
                  key={filterConfig.key}
                  config={filterConfig}
                  value={values[filterConfig.key]}
                  onChange={(value) => onChange(filterConfig.key, value)}
                />
              ))}
            </Space>
          </div>
        </div>
      </div>
    </div>
  );
};
