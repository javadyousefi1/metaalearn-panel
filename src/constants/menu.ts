import {
    LayoutDashboard,
    Users,
    BookOpen,
    Settings,
    BarChart3,
    FolderTree,
    Ticket,
    Wallet,
    CreditCard,
    UserCog,
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
    // {
    //   key: 'dashboard',
    //   path: ROUTES.DASHBOARD.OVERVIEW,
    //   label: 'Dashboard',
    //   icon: LayoutDashboard,
    //   permissions: [Permission.DASHBOARD_VIEW],
    // },
    // {
    //   key: 'analytics',
    //   path: ROUTES.DASHBOARD.ANALYTICS,
    //   label: 'Analytics',
    //   icon: BarChart3,
    //   permissions: [Permission.ANALYTICS_VIEW],
    // },
    {
      key: 'users',
      path: ROUTES.USERS.ROOT,
      label: 'کاربران',
      icon: Users,
    },
    {
      key: 'tickets',
      path: ROUTES.TICKETS.ROOT,
      label: 'تیکت‌ها',
      icon: Ticket,
    },
    {
      key: 'operators',
      path: ROUTES.OPERATORS.ROOT,
      label: 'اپراتور',
      icon: UserCog,
    },
    {
        key: 'courses',
        path: ROUTES.COURSES.ROOT,
        label: 'دوره‌ها',
        icon: BookOpen,
        children: [
            {
                key: 'courses-list',
                path: ROUTES.COURSES.COURSE_LIST,
                label: 'لیست دوره‌ها',
            },
            {
                key: 'categories',
                path: ROUTES.COURSES.CATEGORIES.ROOT,
                label: 'دسته‌بندی‌ها',
                icon: FolderTree,
            },
        ],
    },
    {
        key: 'finance',
        path: ROUTES.FINANCE.ROOT,
        label: 'مالی',
        icon: Wallet,
        children: [
            {
                key: 'credit-cards',
                path: ROUTES.FINANCE.CREDIT_CARDS,
                label: 'کارت‌های بانکی',
                icon: CreditCard,
            },
        ],
    },
    // {
    //   key: 'divider-2',
    //   path: '',
    //   label: '',
    //   divider: true,
    // },
    // {
    //   key: 'settings',
    //   path: ROUTES.SETTINGS.ROOT,
    //   label: 'Settings',
    //   icon: Settings,
    //   permissions: [Permission.SETTINGS_VIEW],
    //   children: [
    //     {
    //       key: 'settings-profile',
    //       path: ROUTES.SETTINGS.PROFILE,
    //       label: 'Profile',
    //     },
    //     {
    //       key: 'settings-account',
    //       path: ROUTES.SETTINGS.ACCOUNT,
    //       label: 'Account',
    //     },
    //     {
    //       key: 'settings-security',
    //       path: ROUTES.SETTINGS.SECURITY,
    //       label: 'Security',
    //     },
    //   ],
    // },
];

export type { LucideIcon };
