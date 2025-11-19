import React from 'react';
import { Input, Select, InputNumber, DatePicker, Tag } from 'antd';
import { FilterConfig, FilterValue, TextFilterConfig, SelectFilterConfig, NumberFilterConfig, DateFilterConfig } from './types';

interface DynamicFilterProps {
  /**
   * Filter configuration
   */
  config: FilterConfig;

  /**
   * Current filter value
   */
  value: FilterValue;

  /**
   * Callback when value changes
   */
  onChange: (value: FilterValue) => void;
}

/**
 * DynamicFilter Component
 *
 * Renders different filter types based on configuration.
 * Supports text, select, number, and date filters.
 *
 * @example
 * <DynamicFilter
 *   config={{ type: 'text', key: 'name', label: 'Name', icon: User }}
 *   value={filters.name}
 *   onChange={(value) => setFilter('name', value)}
 * />
 */
export const DynamicFilter: React.FC<DynamicFilterProps> = ({
  config,
  value,
  onChange,
}) => {
  const { label, icon: Icon, placeholder, width = 240 } = config;

  const renderFilter = () => {
    switch (config.type) {
      case 'text': {
        const textConfig = config as TextFilterConfig;
        return (
          <Input
            value={(value as string) || ''}
            onChange={(e) => {
              const inputValue = e.target.value.trim();
              onChange(inputValue || null);
            }}
            placeholder={placeholder || `جستجوی ${label}`}
            allowClear
            size="large"
            style={{ width }}
            className="shadow-sm"
          />
        );
      }

      case 'select': {
        const selectConfig = config as SelectFilterConfig;
        return (
          <Select
            value={value}
            onChange={onChange}
            placeholder={placeholder || `همه ${label}`}
            allowClear
            size="large"
            style={{ width }}
            className="shadow-sm"
            options={selectConfig.options.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
            optionRender={(option) => {
              const selectedOption = selectConfig.options.find(
                (opt) => opt.value === option.value
              );
              const color = selectedOption?.color ||
                           (selectConfig.getColor ? selectConfig.getColor(option.value) : 'default');

              return (
                <div className="flex items-center gap-2 py-1">
                  <Tag color={color} className="m-0">
                    {option.label}
                  </Tag>
                </div>
              );
            }}
            tagRender={(props) => {
              const selectedOption = selectConfig.options.find(
                (opt) => opt.value === props.value
              );
              const color = selectedOption?.color ||
                           (selectConfig.getColor ? selectConfig.getColor(props.value) : 'default');

              return (
                <Tag
                  color={color}
                  closable={props.closable}
                  onClose={props.onClose}
                  className="m-0 px-3 py-1 text-sm font-medium"
                >
                  {props.label}
                </Tag>
              );
            }}
          />
        );
      }

      case 'number': {
        const numberConfig = config as NumberFilterConfig;
        return (
          <InputNumber
            value={value as number}
            onChange={onChange}
            placeholder={placeholder || label}
            min={numberConfig.min}
            max={numberConfig.max}
            size="large"
            style={{ width }}
            className="shadow-sm w-full"
          />
        );
      }

      case 'date': {
        const dateConfig = config as DateFilterConfig;
        return (
          <DatePicker
            value={value as any}
            onChange={onChange}
            placeholder={placeholder || label}
            format={dateConfig.format}
            size="large"
            style={{ width }}
            className="shadow-sm"
          />
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={16} style={{ color: '#4B26AD' }} />}
        <span className="text-sm font-semibold text-gray-700">{label}</span>
      </div>
      {renderFilter()}
    </div>
  );
};
