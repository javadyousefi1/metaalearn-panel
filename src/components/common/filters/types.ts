import { LucideIcon } from 'lucide-react';

/**
 * Base filter configuration
 */
interface BaseFilterConfig {
  /**
   * Unique key for the filter (matches API parameter name)
   */
  key: string;

  /**
   * Display label for the filter
   */
  label: string;

  /**
   * Icon component to display
   */
  icon?: LucideIcon;

  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Width of the filter component
   */
  width?: number | string;
}

/**
 * Text input filter configuration
 */
export interface TextFilterConfig extends BaseFilterConfig {
  type: 'text';
}

/**
 * Select dropdown option
 */
export interface SelectOption<T = any> {
  value: T;
  label: string;
  color?: string;
}

/**
 * Select dropdown filter configuration
 */
export interface SelectFilterConfig<T = any> extends BaseFilterConfig {
  type: 'select';
  options: SelectOption<T>[];
  /**
   * Function to get color for an option value
   */
  getColor?: (value: T) => string;
}

/**
 * Number input filter configuration
 */
export interface NumberFilterConfig extends BaseFilterConfig {
  type: 'number';
  min?: number;
  max?: number;
}

/**
 * Date picker filter configuration
 */
export interface DateFilterConfig extends BaseFilterConfig {
  type: 'date';
  format?: string;
}

/**
 * Union type of all filter configurations
 */
export type FilterConfig =
  | TextFilterConfig
  | SelectFilterConfig
  | NumberFilterConfig
  | DateFilterConfig;

/**
 * Filter value type
 */
export type FilterValue = string | number | boolean | null | undefined;

/**
 * Filter values object
 */
export interface FilterValues {
  [key: string]: FilterValue;
}
