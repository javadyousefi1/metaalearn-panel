export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface OtpLoginCredentials {
  phoneNumber: string;
}

export interface OtpResponse {
  message: string;
  expiresIn?: number;
}

export interface VerifyOtpRequest {
  phoneNumber: string;
  code: string;
}

export interface ResendOtpRequest {
  phoneNumber: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  TEACHER = 'teacher',
  STUDENT = 'student',
  MODERATOR = 'moderator',
}

export enum Permission {
  // User Management
  USER_VIEW = 'user.view',
  USER_CREATE = 'user.create',
  USER_UPDATE = 'user.update',
  USER_DELETE = 'user.delete',

  // Course Management
  COURSE_VIEW = 'course.view',
  COURSE_CREATE = 'course.create',
  COURSE_UPDATE = 'course.update',
  COURSE_DELETE = 'course.delete',

  // Settings
  SETTINGS_VIEW = 'settings.view',
  SETTINGS_UPDATE = 'settings.update',

  // Dashboard
  DASHBOARD_VIEW = 'dashboard.view',
  ANALYTICS_VIEW = 'analytics.view',
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
