import React from 'react';
import { Select, Tag } from 'antd';
import { ShieldCheck } from 'lucide-react';
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
  placeholder = 'همه وضعیت‌ها',
  label = 'وضعیت هویت',
  width = 240,
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
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <ShieldCheck size={16} style={{ color: '#4B26AD' }} />
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
        options={statusOptions.map((option) => ({
          value: option.value,
          label: option.label,
        }))}
        optionRender={(option) => (
          <div className="flex items-center gap-2 py-1">
            <Tag color={getIdentityStatusColor(option.value as IdentityStatusType)} className="m-0">
              {option.label}
            </Tag>
          </div>
        )}
        tagRender={(props) => {
          const status = props.value as IdentityStatusType;
          return (
            <Tag
              color={getIdentityStatusColor(status)}
              closable={props.closable}
              onClose={props.onClose}
              className="m-0 px-3 py-1 text-sm font-medium"
            >
              {getIdentityStatusName(status)}
            </Tag>
          );
        }}
      />
    </div>
  );
};
