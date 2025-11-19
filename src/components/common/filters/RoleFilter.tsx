import React from 'react';
import { Select, Tag } from 'antd';
import { UserCog } from 'lucide-react';
import { RoleType, getRoleTypeName } from '@/types/user.types';

export interface RoleFilterProps {
  /**
   * Current selected role value
   */
  value?: RoleType | null;

  /**
   * Callback when the role changes
   */
  onChange: (value: RoleType | null) => void;

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
 * RoleFilter Component
 *
 * A filter component for selecting user roles.
 * Provides a clean dropdown interface with all available roles.
 *
 * @example
 * <RoleFilter
 *   value={filters.role}
 *   onChange={(value) => setFilter('Role', value)}
 * />
 */
export const RoleFilter: React.FC<RoleFilterProps> = ({
  value,
  onChange,
  placeholder = 'همه نقش‌ها',
  label = 'نقش کاربر',
  width = 240,
}) => {
  // All available role options
  const roleOptions = [
    { value: RoleType.SuperAdmin, label: getRoleTypeName(RoleType.SuperAdmin) },
    { value: RoleType.Instructor, label: getRoleTypeName(RoleType.Instructor) },
    { value: RoleType.Student, label: getRoleTypeName(RoleType.Student) },
    { value: RoleType.Operator, label: getRoleTypeName(RoleType.Operator) },
    { value: RoleType.OperatorAdmin, label: getRoleTypeName(RoleType.OperatorAdmin) },
  ];

  // Color mapping for roles
  const getRoleColor = (role: RoleType): string => {
    switch (role) {
      case RoleType.SuperAdmin:
        return 'red';
      case RoleType.Instructor:
        return 'blue';
      case RoleType.Student:
        return 'green';
      case RoleType.Operator:
        return 'orange';
      case RoleType.OperatorAdmin:
        return 'purple';
      default:
        return 'default';
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <UserCog size={16} style={{ color: '#4B26AD' }} />
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
        options={roleOptions.map((option) => ({
          value: option.value,
          label: option.label,
        }))}
        optionRender={(option) => (
          <div className="flex items-center gap-2 py-1">
            <Tag color={getRoleColor(option.value as RoleType)} className="m-0">
              {option.label}
            </Tag>
          </div>
        )}
        tagRender={(props) => {
          const role = props.value as RoleType;
          return (
            <Tag
              color={getRoleColor(role)}
              closable={props.closable}
              onClose={props.onClose}
              className="m-0 px-3 py-1 text-sm font-medium"
            >
              {getRoleTypeName(role)}
            </Tag>
          );
        }}
      />
    </div>
  );
};
