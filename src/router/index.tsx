import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout, AuthLayout } from '@/layouts';
import { ProtectedRoute } from '@/components/common';
import { LoginPage } from '@/pages/auth';
import { DashboardPage } from '@/pages/dashboard';
import { UsersPage } from '@/pages/users';
import { TicketsPage, TicketDetailPage } from '@/pages/tickets';
import { OperatorTicketsPage, OperatorTicketDetailPage } from '@/pages/operators';
import { CoursesPage, CourseListPage } from '@/pages/courses';
import { CourseDetailPage, CourseFaqPage, CourseSessionsPage, CourseIntroductionPage, CourseSchedulePage, CourseGalleryPage } from '@/pages/course';
import { CategoriesPage, SubCategoriesPage } from '@/pages/categories';
import { BankCardsPage, TransactionsPage } from '@/pages/finance';
import { SettingsPage } from '@/pages/settings';
import { ROUTES } from '@/constants';
import { Permission } from '@/types';

/**
 * Application Router Configuration
 */
export const router = createBrowserRouter([
  // Redirect root to dashboard
  {
    path: '/',
    element: <Navigate to={ROUTES.DASHBOARD.OVERVIEW} replace />,
  },

  // Auth Routes
  {
    path: ROUTES.AUTH.ROOT,
    element: <AuthLayout />,
    children: [
      {
        path: ROUTES.AUTH.LOGIN,
        element: <LoginPage />,
      },
    ],
  },

  // Protected Routes
  {
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      // Dashboard
      {
        path: ROUTES.DASHBOARD.OVERVIEW,
        element: <DashboardPage />,
      },

      // Users Management
      {
        path: ROUTES.USERS.ROOT,
        element: <UsersPage />,
      },

      // Tickets Management
      {
        path: ROUTES.TICKETS.ROOT,
        element: <TicketsPage />,
      },
      {
        path: ROUTES.TICKETS.DETAIL_PATH,
        element: <TicketDetailPage />,
      },

      // Operators Management (Course Tickets)
      {
        path: ROUTES.OPERATORS.ROOT,
        element: <OperatorTicketsPage />,
      },
      {
        path: ROUTES.OPERATORS.DETAIL_PATH,
        element: <OperatorTicketDetailPage />,
      },

      // Finance Management
      {
        path: ROUTES.FINANCE.CREDIT_CARDS,
        element: <BankCardsPage />,
      },
      {
        path: ROUTES.FINANCE.TRANSACTIONS,
        element: <TransactionsPage />,
      },

      // Courses Management
      {
        path: ROUTES.COURSES.ROOT,
        element: (
            <CoursesPage />
        ),
      },
      {
        path: ROUTES.COURSES.COURSE_LIST,
        element: (
            <CourseListPage />
        ),
      },

      // Categories Management
      {
        path: ROUTES.COURSES.CATEGORIES.ROOT,
        element: <CategoriesPage />,
      },
      {
        path: ROUTES.COURSES.CATEGORIES.SUB(":id"),
        element: <SubCategoriesPage />,
      },

      // Course Detail with nested routes
      {
        path: ROUTES.COURSE.DETAIL,
        element: <CourseDetailPage />,
        children: [
          {
            path: ROUTES.COURSE.INTRODUCTION_PATH,
            element: <CourseIntroductionPage />,
          },
          {
            path: ROUTES.COURSE.FAQ_PATH,
            element: <CourseFaqPage />,
          },
          {
            path: ROUTES.COURSE.SESSIONS_PATH,
            element: <CourseSessionsPage />,
          },
          {
            path: ROUTES.COURSE.SCHEDULES_PATH,
            element: <CourseSchedulePage />,
          },
          {
            path: ROUTES.COURSE.GALLERY_PATH,
            element: <CourseGalleryPage />,
          },
        ],
      },

      // Settings
      {
        path: ROUTES.SETTINGS.ROOT,
        element: (
          <ProtectedRoute permissions={[Permission.SETTINGS_VIEW]}>
            <SettingsPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
