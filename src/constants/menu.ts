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
    Receipt,
    FileText,
    ClipboardList,
    Bell,
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
    //   roles: ['super-admin', 'operator-admin'],
    // },
    // {
    //   key: 'analytics',
    //   path: ROUTES.DASHBOARD.ANALYTICS,
    //   label: 'Analytics',
    //   icon: BarChart3,
    //   permissions: [Permission.ANALYTICS_VIEW],
    //   roles: ['super-admin', 'operator-admin'],
    // },
    {
      key: 'users',
      path: ROUTES.USERS.ROOT,
      label: 'کاربران',
      icon: Users,
      roles: ['super-admin'], // Only admins can manage users
    },
    {
      key: 'notifications',
      path: ROUTES.NOTIFICATIONS.ROOT,
      label: 'اعلانات',
      icon: Bell,
      roles: ['super-admin', 'operator-admin'], // Admins can send notifications
    },
    {
      key: 'tickets',
      path: ROUTES.TICKETS.ROOT,
      label: 'تیکت‌ها',
      icon: Ticket,
      roles: ['super-admin'], // Admins and operators can view tickets
    },
    {
      key: 'operators',
      path: ROUTES.OPERATORS.ROOT,
      label: 'اپراتور',
      icon: UserCog,
      roles: ['super-admin', 'operator-admin', 'operator', 'instructor'], // Operators and instructors
      children: [
        {
          key: 'operators-tickets',
          path: ROUTES.OPERATORS.LIST,
          label: 'تیکت‌ها',
          icon: Ticket,
          roles: ['super-admin', 'operator-admin', 'operator','instructor'],
        },
        {
          key: 'operators-practices',
          path: ROUTES.OPERATORS.PRACTICES,
          label: 'تمرین‌ها',
          icon: ClipboardList,
          roles: ['super-admin', 'operator-admin', 'operator', 'instructor'],
        },
      ],
    },
    {
        key: 'courses',
        path: ROUTES.COURSES.ROOT,
        label: 'دوره‌ها',
        icon: BookOpen,
        roles: ['super-admin', 'instructor'], // Admins and instructors
        children: [
            {
                key: 'courses-list',
                path: ROUTES.COURSES.COURSE_LIST,
                label: 'لیست دوره‌ها',
                roles: ['super-admin','instructor'],
            },
            {
                key: 'categories',
                path: ROUTES.COURSES.CATEGORIES.ROOT,
                label: 'دسته‌بندی‌ها',
                icon: FolderTree,
                roles: ['super-admin',], // Only admins can manage categories
            },
        ],
    },
    {
        key: 'blogs',
        path: ROUTES.BLOGS.ROOT,
        label: 'مقالات',
        icon: FileText,
        roles: ['super-admin', 'operator-admin'], // Only admins can manage blogs
        children: [
            {
                key: 'blogs-list',
                path: ROUTES.BLOGS.LIST,
                label: 'لیست مقالات',
                roles: ['super-admin', 'operator-admin'],
            },
            {
                key: 'blog-categories',
                path: ROUTES.BLOGS.CATEGORIES,
                label: 'دسته‌بندی‌ها',
                icon: FolderTree,
                roles: ['super-admin', 'operator-admin'],
            },
        ],
    },
    {
        key: 'finance',
        path: ROUTES.FINANCE.ROOT,
        label: 'مالی',
        icon: Wallet,
        roles: ['super-admin'], // Only admins can view finance
        children: [
            {
                key: 'credit-cards',
                path: ROUTES.FINANCE.CREDIT_CARDS,
                label: 'کارت‌های بانکی',
                icon: CreditCard,
                roles: ['super-admin'],
            },
            {
                key: 'payment-instructions',
                path: ROUTES.FINANCE.PAYMENT_INSTRUCTIONS,
                label: 'کارت ها',
                icon: CreditCard,
                roles: ['super-admin'],
            },
            {
                key: 'transactions',
                path: ROUTES.FINANCE.TRANSACTIONS,
                label: 'تاریخچه تراکنش',
                icon: Receipt,
                roles: ['super-admin'],
            },
        ],
    },
];

export type { LucideIcon };
