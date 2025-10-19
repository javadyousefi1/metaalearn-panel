import {
  LayoutDashboard,
  Users,
  BookOpen,
  Settings,
  BarChart3,
  LucideIcon,
} from 'lucide-react';
import { ROUTES } from './routes';
import { Permission } from '@/types';
import { MenuItemConfig } from '@/types/route.types';

/**
 * Menu Configuration
 * Defines the sidebar menu structure with icons, permissions, and routes
 */
export const MENU_ITEMS: MenuItemConfig[] = [
  {
    key: 'dashboard',
    path: ROUTES.DASHBOARD.OVERVIEW,
    label: 'Dashboard',
    icon: LayoutDashboard,
    permissions: [Permission.DASHBOARD_VIEW],
  },
  {
    key: 'analytics',
    path: ROUTES.DASHBOARD.ANALYTICS,
    label: 'Analytics',
    icon: BarChart3,
    permissions: [Permission.ANALYTICS_VIEW],
  },
  {
    key: 'divider-1',
    path: '',
    label: '',
    divider: true,
  },
  {
    key: 'users',
    path: ROUTES.USERS.ROOT,
    label: 'Users',
    icon: Users,
    permissions: [Permission.USER_VIEW],
  },
  {
    key: 'courses',
    path: ROUTES.COURSES.ROOT,
    label: 'Courses',
    icon: BookOpen,
    permissions: [Permission.COURSE_VIEW],
  },
  {
    key: 'divider-2',
    path: '',
    label: '',
    divider: true,
  },
  {
    key: 'settings',
    path: ROUTES.SETTINGS.ROOT,
    label: 'Settings',
    icon: Settings,
    permissions: [Permission.SETTINGS_VIEW],
    children: [
      {
        key: 'settings-profile',
        path: ROUTES.SETTINGS.PROFILE,
        label: 'Profile',
      },
      {
        key: 'settings-account',
        path: ROUTES.SETTINGS.ACCOUNT,
        label: 'Account',
      },
      {
        key: 'settings-security',
        path: ROUTES.SETTINGS.SECURITY,
        label: 'Security',
      },
    ],
  },
];

export type { LucideIcon };
