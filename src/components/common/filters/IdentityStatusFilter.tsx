import React from 'react';
import { Select, Tag } from 'antd';
import { IdentityStatusType, getIdentityStatusName, getIdentityStatusColor } from '@/types/user.types';

export interface IdentityStatusFilterProps {
  /**
   * Current selected identity status value
   */
  value?: IdentityStatusType | null;

  /**
   * Callback when the status changes
   */
  onChange: (value: IdentityStatusType | null) => void;

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
 * IdentityStatusFilter Component
 *
 * A filter component for selecting user identity status.
 * Provides a clean dropdown interface with all available identity statuses.
 *
 * @example
 * <IdentityStatusFilter
 *   value={filters.identityStatus}
 *   onChange={(value) => setFilter('IdentityStatus', value)}
 * />
 */
export const IdentityStatusFilter: React.FC<IdentityStatusFilterProps> = ({
  value,
  onChange,
  placeholder = 'انتخاب وضعیت هویت',
  label,
  width = 220,
}) => {
  // All available identity status options
  const statusOptions = [
    { value: IdentityStatusType.None, label: getIdentityStatusName(IdentityStatusType.None) },
    { value: IdentityStatusType.Requested, label: getIdentityStatusName(IdentityStatusType.Requested) },
    { value: IdentityStatusType.Pending, label: getIdentityStatusName(IdentityStatusType.Pending) },
    { value: IdentityStatusType.Verified, label: getIdentityStatusName(IdentityStatusType.Verified) },
    { value: IdentityStatusType.Rejected, label: getIdentityStatusName(IdentityStatusType.Rejected) },
    { value: IdentityStatusType.Revoked, label: getIdentityStatusName(IdentityStatusType.Revoked) },
  ];

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <span className="text-sm font-medium text-gray-700">{label}</span>
      )}
      <Select
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        allowClear
        style={{ width }}
        options={statusOptions.map((option) => ({
          value: option.value,
          label: (
            <Tag color={getIdentityStatusColor(option.value)}>
              {option.label}
            </Tag>
          ),
        }))}
        tagRender={(props) => {
          const status = props.value as IdentityStatusType;
          return (
            <Tag
              color={getIdentityStatusColor(status)}
              closable={props.closable}
              onClose={props.onClose}
              style={{ marginRight: 3 }}
            >
              {getIdentityStatusName(status)}
            </Tag>
          );
        }}
      />
    </div>
  );
};
