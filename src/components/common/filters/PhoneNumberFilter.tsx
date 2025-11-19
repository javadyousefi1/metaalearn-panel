import React from 'react';
import { Input } from 'antd';
import { Phone } from 'lucide-react';

export interface PhoneNumberFilterProps {
  /**
   * Current phone number value
   */
  value?: string | null;

  /**
   * Callback when the phone number changes
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
 * PhoneNumberFilter Component
 *
 * A filter component for searching users by phone number.
 * Provides a text input for entering phone numbers.
 *
 * @example
 * <PhoneNumberFilter
 *   value={filters.phoneNumber}
 *   onChange={(value) => setFilter('PhoneNumber', value)}
 * />
 */
export const PhoneNumberFilter: React.FC<PhoneNumberFilterProps> = ({
  value,
  onChange,
  placeholder = 'جستجوی شماره تلفن',
  label = 'شماره تلفن',
  width = 240,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.trim();
    onChange(inputValue || null);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Phone size={16} style={{ color: '#4B26AD' }} />
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
