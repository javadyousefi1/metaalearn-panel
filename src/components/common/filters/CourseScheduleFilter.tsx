import React from 'react';
import { Select } from 'antd';
import { Calendar } from 'lucide-react';

export interface CourseScheduleOption {
  id: string;
  name: string;
}

export interface CourseScheduleFilterProps {
  /**
   * Current selected course schedule ID
   */
  value?: string | null;

  /**
   * Callback when the course schedule changes
   */
  onChange: (value: string | null) => void;

  /**
   * Course schedules to display in dropdown
   */
  schedules: CourseScheduleOption[];

  /**
   * Loading state
   */
  loading?: boolean;

  /**
   * Optional placeholder text
   */
  placeholder?: string;

  /**
   * Optional label
   */
  label?: string;

  /**
   * Width of the select component
   */
  width?: number | string;
}

/**
 * CourseScheduleFilter Component
 *
 * A filter component for selecting course schedules (groups).
 * Provides a clean dropdown interface with all available schedules.
 *
 * @example
 * <CourseScheduleFilter
 *   value={filters.courseScheduleId}
 *   onChange={(value) => setFilter('CourseScheduleId', value)}
 *   schedules={courseSchedules}
 *   loading={isLoadingSchedules}
 * />
 */
export const CourseScheduleFilter: React.FC<CourseScheduleFilterProps> = ({
  value,
  onChange,
  schedules,
  loading = false,
  placeholder = 'همه گروه‌ها',
  label = 'گروه دوره',
  width = 240,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Calendar size={16} style={{ color: '#4B26AD' }} />
        <span className="text-sm font-semibold text-gray-700">{label}</span>
      </div>
      <Select
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        allowClear
        size="large"
        style={{ width }}
        className="shadow-sm"
        loading={loading}
        showSearch
        filterOption={(input, option) =>
          (option?.label?.toString() ?? '').toLowerCase().includes(input.toLowerCase())
        }
        options={schedules.map((schedule) => ({
          value: schedule.id,
          label: schedule.name,
        }))}
      />
    </div>
  );
};
