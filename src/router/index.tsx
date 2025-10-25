import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout, AuthLayout } from '@/layouts';
import { ProtectedRoute } from '@/components/common';
import { LoginPage } from '@/pages/auth';
import { DashboardPage } from '@/pages/dashboard';
import { UsersPage } from '@/pages/users';
import { CoursesPage, CourseListPage } from '@/pages/courses';
import { CourseDetailPage, CourseFaqPage, CourseSessionsPage } from '@/pages/course';
import { CategoriesPage, SubCategoriesPage } from '@/pages/categories';
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
        element: (
          <ProtectedRoute permissions={[Permission.USER_VIEW]}>
            <UsersPage />
          </ProtectedRoute>
        ),
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
            path: ROUTES.COURSE.FAQ_PATH,
            element: <CourseFaqPage />,
          },
          {
            path: ROUTES.COURSE.SESSIONS_PATH,
            element: <CourseSessionsPage />,
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
