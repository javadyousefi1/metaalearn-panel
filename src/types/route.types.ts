import { Permission } from './auth.types';
import { LucideIcon } from 'lucide-react';

export interface RouteConfig {
  path: string;
  title: string;
  element: React.ReactNode;
  isProtected?: boolean;
  permissions?: Permission[];
  layout?: 'default' | 'auth' | 'blank';
  children?: RouteConfig[];
}

export interface MenuItemConfig {
  key: string;
  path: string;
  label: string;
  icon?: LucideIcon;
  permissions?: Permission[];
  roles?: string[]; // Array of roles that can access this menu item
  children?: MenuItemConfig[];
  divider?: boolean;
}

export interface BreadcrumbItem {
  title: string;
  path?: string;
}
