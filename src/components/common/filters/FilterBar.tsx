import React from 'react';
import { Card, Button, Space, Badge } from 'antd';
import { FilterOutlined, ClearOutlined } from '@ant-design/icons';

export interface FilterBarProps {
  /**
   * Child filter components to render
   */
  children: React.ReactNode;

  /**
   * Number of active filters
   */
  activeFilterCount?: number;

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
 * FilterBar Component
 *
 * A reusable container component for rendering table filters.
 * Provides a clean UI with filter controls and clear all functionality.
 *
 * @example
 * <FilterBar
 *   activeFilterCount={filters.activeFilterCount}
 *   onClearAll={clearFilters}
 * >
 *   <IdentityStatusFilter value={filters.identityStatus} onChange={...} />
 *   <RoleFilter value={filters.role} onChange={...} />
 * </FilterBar>
 */
export const FilterBar: React.FC<FilterBarProps> = ({
  children,
  activeFilterCount = 0,
  onClearAll,
  title = 'فیلترها',
  className = '',
}) => {
  return (
    <Card
      className={`mb-4 ${className}`}
      bodyStyle={{ padding: '16px' }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FilterOutlined className="text-lg" />
          <span className="font-semibold text-base">{title}</span>
          {activeFilterCount > 0 && (
            <Badge
              count={activeFilterCount}
              style={{ backgroundColor: '#4B26AD' }}
            />
          )}
        </div>

        {activeFilterCount > 0 && onClearAll && (
          <Button
            type="link"
            size="small"
            icon={<ClearOutlined />}
            onClick={onClearAll}
            className="text-gray-500 hover:text-red-500"
          >
            پاک کردن همه
          </Button>
        )}
      </div>

      <Space wrap size="middle" className="w-full">
        {children}
      </Space>
    </Card>
  );
};
