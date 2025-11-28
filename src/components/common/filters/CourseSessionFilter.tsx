import React from 'react';
import { Select } from 'antd';
import { BookOpen } from 'lucide-react';

export interface CourseSessionOption {
  id: string;
  name: string;
}

export interface CourseSessionFilterProps {
  /**
   * Current selected course session ID
   */
  value?: string | null;

  /**
   * Callback when the course session changes
   */
  onChange: (value: string | null) => void;

  /**
   * Course sessions to display in dropdown
   */
  sessions: CourseSessionOption[];

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
 * CourseSessionFilter Component
 *
 * A filter component for selecting course sessions.
 * Provides a clean dropdown interface with all available sessions.
 *
 * @example
 * <CourseSessionFilter
 *   value={filters.courseSessionId}
 *   onChange={(value) => setFilter('CourseSessionId', value)}
 *   sessions={courseSessions}
 *   loading={isLoadingSessions}
 * />
 */
export const CourseSessionFilter: React.FC<CourseSessionFilterProps> = ({
  value,
  onChange,
  sessions,
  loading = false,
  placeholder = 'همه جلسات',
  label = 'جلسه دوره',
  width = 240,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <BookOpen size={16} style={{ color: '#4B26AD' }} />
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
        options={sessions.map((session) => ({
          value: session.id,
          label: session.name,
        }))}
      />
    </div>
  );
};
