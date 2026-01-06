import React from 'react';
import { Select } from 'antd';
import { BookOpen } from 'lucide-react';
import { Course } from '@/types/course.types';

export interface CourseFilterProps {
  /**
   * Current selected course ID
   */
  value?: string | null;

  /**
   * Callback when the course changes
   */
  onChange: (value: string | null) => void;

  /**
   * Courses to display in dropdown
   */
  courses: Course[];

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

  /**
   * Hide the internal label (useful when using with Form.Item label)
   */
  hideLabel?: boolean;
}

/**
 * CourseFilter Component
 *
 * A filter component for selecting courses.
 * Provides a clean dropdown interface with all available courses.
 *
 * @example
 * <CourseFilter
 *   value={filters.courseId}
 *   onChange={(value) => setFilter('CourseId', value)}
 *   courses={courses}
 *   loading={isLoadingCourses}
 * />
 */
export const CourseFilter: React.FC<CourseFilterProps> = ({
  value,
  onChange,
  courses,
  loading = false,
  placeholder = 'همه دوره‌ها',
  label = 'دوره',
  width = 240,
  hideLabel = false,
}) => {
  return (
    <div className="flex flex-col gap-2">
      {!hideLabel && (
        <div className="flex items-center gap-2">
          <BookOpen size={16} style={{ color: '#4B26AD' }} />
          <span className="text-sm font-semibold text-gray-700">{label}</span>
        </div>
      )}
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
        options={courses.map((course) => ({
          value: course.id,
          label: course.name,
        }))}
      />
    </div>
  );
};
