import React from 'react';
import { Input } from 'antd';
import { User } from 'lucide-react';

export interface FullNameFaFilterProps {
  /**
   * Current full name value
   */
  value?: string | null;

  /**
   * Callback when the full name changes
   */
  onChange: (value: string | null) => void;

  /**
   * Optional placeholder text
   */
  placeholder?: string;

  /**
   * Optional label
   */
  label?: string;

  /**
   * Width of the input component
   */
  width?: number | string;
}

/**
 * FullNameFaFilter Component
 *
 * A filter component for searching users by their Persian full name.
 * Provides a text input for entering names.
 *
 * @example
 * <FullNameFaFilter
 *   value={filters.fullNameFa}
 *   onChange={(value) => setFilter('FullNameFa', value)}
 * />
 */
export const FullNameFaFilter: React.FC<FullNameFaFilterProps> = ({
  value,
  onChange,
  placeholder = 'جستجوی نام کاربر',
  label = 'نام کاربر',
  width = 240,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.trim();
    onChange(inputValue || null);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <User size={16} style={{ color: '#4B26AD' }} />
        <span className="text-sm font-semibold text-gray-700">{label}</span>
      </div>
      <Input
        value={value || ''}
        onChange={handleChange}
        placeholder={placeholder}
        allowClear
        size="large"
        style={{ width }}
        className="shadow-sm"
      />
    </div>
  );
};
