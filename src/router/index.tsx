import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout, AuthLayout } from '@/layouts';
import { ProtectedRoute } from '@/components/common';
import { LoginPage, ResetPasswordPage } from '@/pages/auth';
import { DashboardPage } from '@/pages/dashboard';
import { UsersPage } from '@/pages/users';
import { TicketsPage, TicketDetailPage } from '@/pages/tickets';
import { OperatorTicketsPage, OperatorTicketDetailPage, OperatorPracticesPage, OperatorPracticeDetailPage } from '@/pages/operators';
import { CoursesPage, CourseListPage, ExamCoursesPage, ExamListPage } from '@/pages/courses';
import { CourseDetailPage, CourseFaqPage, CourseSessionsPage, CourseIntroductionPage, CourseSchedulePage, CourseGalleryPage, CourseCommentsPage } from '@/pages/course';
import { CategoriesPage, SubCategoriesPage } from '@/pages/categories';
import { BlogListPage, BlogCategoryPage, BlogDetailPage, BlogInfoPage, BlogGalleryPage } from '@/pages/blogs';
import { BankCardsPage, PaymentInstructionsPage, TransactionsPage, InstallmentsPage, CourseInstallmentUsersPage } from '@/pages/finance';
import { NotificationsPage } from '@/pages/notifications';
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
      {
        path: ROUTES.AUTH.RESET_PASSWORD,
        element: <ResetPasswordPage />,
      },
      // Optional: keep forgot-password route working by pointing it here
      {
        path: ROUTES.AUTH.FORGOT_PASSWORD,
        element: <ResetPasswordPage />,
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
      {
        path: ROUTES.OPERATORS.PRACTICES,
        element: <OperatorPracticesPage />,
      },
      {
        path: ROUTES.OPERATORS.PRACTICE_DETAIL_PATH,
        element: <OperatorPracticeDetailPage />,
      },

      // Finance Management
      {
        path: ROUTES.FINANCE.CREDIT_CARDS,
        element: <BankCardsPage />,
      },
      {
        path: ROUTES.FINANCE.PAYMENT_INSTRUCTIONS,
        element: <PaymentInstructionsPage />,
      },
      {
        path: ROUTES.FINANCE.TRANSACTIONS,
        element: <TransactionsPage />,
      },
      {
        path: ROUTES.FINANCE.INSTALLMENTS,
        element: <InstallmentsPage />,
      },
      {
        path: ROUTES.FINANCE.INSTALLMENT_DETAIL_PATH,
        element: <CourseInstallmentUsersPage />,
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

      // Exams Management
      {
        path: ROUTES.COURSES.EXAMS.ROOT,
        element: <ExamCoursesPage />,
      },
      {
        path: ROUTES.COURSES.EXAMS.DETAIL_PATH,
        element: <ExamListPage />,
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
          {
            path: ROUTES.COURSE.COMMENTS_PATH,
            element: <CourseCommentsPage />,
          },
        ],
      },

      // Blog Management
      {
        path: ROUTES.BLOGS.LIST,
        element: <BlogListPage />,
      },
      {
        path: ROUTES.BLOGS.CATEGORIES,
        element: <BlogCategoryPage />,
      },

      // Blog Detail with nested routes
      {
        path: ROUTES.BLOG.DETAIL,
        element: <BlogDetailPage />,
        children: [
          {
            path: ROUTES.BLOG.INFO_PATH,
            element: <BlogInfoPage />,
          },
          {
            path: ROUTES.BLOG.GALLERY_PATH,
            element: <BlogGalleryPage />,
          },
        ],
      },
      // Blog Create with nested routes
      {
        path: ROUTES.BLOGS.CREATE,
        element: <BlogDetailPage />,
        children: [
          {
            path: ROUTES.BLOGS.CREATE_INFO,
            element: <BlogInfoPage />,
          },
        ],
      },

      // Notifications
      {
        path: ROUTES.NOTIFICATIONS.ROOT,
        element: <NotificationsPage />,
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
