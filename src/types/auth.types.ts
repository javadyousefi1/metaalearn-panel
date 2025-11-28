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

export interface UserInfo {
  fullNameFa: string;
  firstNameFa: string;
  lastNameFa: string;
  phoneNumber: string;
  imageUrl: string;
  username: string;
  address: string | null;
  referralId: string;
  isProfileComplete: boolean;
  identityStatusType: number;
  identityMessage: string;
  id: string;
}

export interface CreditCard {
  pan: string;
  shaba: string;
  imageUrl: string;
  identityImageUrl: string;
  identityStatusType: number;
  message: string;
  id: string;
}

export interface Transaction {
  amount: number;
  dueDate: string;
  installmentStep: number;
  isPaid: boolean;
  paymentId: string;
  paidTime: string;
  createdTime: string;
  updatedTime: string;
  id: string;
}

export interface Invoice {
  paymentType: number;
  valueType: number;
  valueId: string;
  valuePrice: number;
  valueInstallmentCount: number;
  valueMinimumInstallmentToPay: number;
  isSettled: boolean;
  settledTime: string;
  transactions: Transaction[];
  createdTime: string;
  updatedTime: string;
  valueInfo: any | null;
  id: string;
}

export interface User {
  info: UserInfo;
  profile: any | null;
  creditCards: CreditCard[];
  wallet: any | null;
  invoices: Invoice[];
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
