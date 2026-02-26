import { UserRole, Permission } from './auth.types';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  permissions: Permission[];
  phone?: string;
  bio?: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  avatar?: string;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions?: Permission[];
}

// Credit Card Types
export enum CreditCardIdentityStatusType {
  None = 0, // Credit card just created!
  Pending = 1, // Credit card submitted, waiting for admin verification
  Verified = 2, // Admin approved the credit card
  Rejected = 3, // Admin rejected the credit card
}

export enum CreditCardIdentityActionType {
  Verify = 1, // SuperAdmin verifies credit card
  Reject = 2, // SuperAdmin rejects credit card
}

export interface CreditCard {
  pan: string;
  shaba: string;
  imageUrl: string;
  identityImageUrl: string;
  identityStatusType: CreditCardIdentityStatusType;
  message: string | null;
  id: string;
}

export interface UpdateCreditCardIdentityPayload {
  actionType: CreditCardIdentityActionType;
  creditCardId: string;
  message?: string; // Optional, not needed for Verify action
}

// User list types for the users management page
export interface UserListItem {
  id: string;
  fullNameFa: string;
  phoneNumber: string;
  username: string | null;
  imageUrl: string | null;
  referralId: string;
  isActive: boolean;
  profile: any;
  identity: any;
  creditCards: CreditCard[] | null;
  roles: string[];
  createdTime: string;
  updatedTime: string | null;
}

export interface GetAllUsersParams {
  PageIndex: number;
  PageSize: number;
  IncludeProfile?: boolean;
  IncludeIdentity?: boolean;
  IncludeCreditCards?: boolean;
  IdentityStatus?: IdentityStatusType; // Filter by identity status
  CreditCardStatus?: CreditCardIdentityStatusType; // Filter by credit card status
  PhoneNumber?: string; // Filter by phone number
  FullNameFa?: string; // Filter by full name (Persian)
  Role?: RoleType; // Filter by role
}

export interface AllUsersResponse {
  items: UserListItem[];
  totalCount: number;
}

// Identity Status Types - What's stored in DB and shown in table
export enum IdentityStatusType {
  None = 0, // User just created!
  Requested = 1, // User requested identity verification
  Pending = 2, // Documents uploaded, waiting for admin verification
  Verified = 3, // Admin verified the documents
  Rejected = 4, // Admin rejected the documents
  Revoked = 5, // Verification was revoked by admin
}

// Identity Action Types - What admin can do
export enum IdentityActionType {
  Request = 1, // User requests identity verification
  Verify = 2, // SuperAdmin verifies identity
  Reject = 3, // SuperAdmin rejects identity
  Revoke = 4, // SuperAdmin revokes identity
}

export interface UpdateUserIdentityPayload {
  actionType: IdentityActionType;
  userId: string;
  message?: string; // Optional, not needed for Verify action
}

// Helper functions for identity status display
export const getIdentityStatusName = (status: IdentityStatusType): string => {
  switch (status) {
    case IdentityStatusType.None:
      return 'بدون وضعیت';
    case IdentityStatusType.Requested:
      return 'درخواست شده';
    case IdentityStatusType.Pending:
      return 'در انتظار بررسی';
    case IdentityStatusType.Verified:
      return 'تایید شده';
    case IdentityStatusType.Rejected:
      return 'رد شده';
    case IdentityStatusType.Revoked:
      return 'لغو شده';
    default:
      return 'نامشخص';
  }
};

export const getIdentityStatusColor = (status: IdentityStatusType): string => {
  switch (status) {
    case IdentityStatusType.None:
      return 'default';
    case IdentityStatusType.Requested:
      return 'blue';
    case IdentityStatusType.Pending:
      return 'orange';
    case IdentityStatusType.Verified:
      return 'green';
    case IdentityStatusType.Rejected:
      return 'red';
    case IdentityStatusType.Revoked:
      return 'volcano';
    default:
      return 'default';
  }
};

// Helper functions for identity action display
export const getIdentityActionName = (action: IdentityActionType): string => {
  switch (action) {
    case IdentityActionType.Request:
      return 'درخواست احراز هویت';
    case IdentityActionType.Verify:
      return 'تایید هویت';
    case IdentityActionType.Reject:
      return 'رد هویت';
    case IdentityActionType.Revoke:
      return 'لغو هویت';
    default:
      return 'نامشخص';
  }
};

// Helper functions for credit card status display
export const getCreditCardStatusName = (status: CreditCardIdentityStatusType): string => {
  switch (status) {
    case CreditCardIdentityStatusType.None:
      return 'بدون وضعیت';
    case CreditCardIdentityStatusType.Pending:
      return 'در انتظار تایید';
    case CreditCardIdentityStatusType.Verified:
      return 'تایید شده';
    case CreditCardIdentityStatusType.Rejected:
      return 'رد شده';
    default:
      return 'نامشخص';
  }
};

export const getCreditCardStatusColor = (status: CreditCardIdentityStatusType): string => {
  switch (status) {
    case CreditCardIdentityStatusType.None:
      return 'default';
    case CreditCardIdentityStatusType.Pending:
      return 'orange';
    case CreditCardIdentityStatusType.Verified:
      return 'green';
    case CreditCardIdentityStatusType.Rejected:
      return 'red';
    default:
      return 'default';
  }
};

// Helper functions for credit card action display
export const getCreditCardActionName = (action: CreditCardIdentityActionType): string => {
  switch (action) {
    case CreditCardIdentityActionType.Verify:
      return 'تایید کارت';
    case CreditCardIdentityActionType.Reject:
      return 'رد کارت';
    default:
      return 'نامشخص';
  }
};

// Role Management Types
export enum RoleType {
  SuperAdmin = 0,
  Instructor = 1,
  Student = 2,
  Operator = 3,
  OperatorAdmin = 4,
}

export interface RoleManagementPayload {
  userId: string;
  roleType: RoleType;
  isAssign: boolean;
}

// Helper functions for role display
export const getRoleTypeName = (role: RoleType): string => {
  switch (role) {
    case RoleType.SuperAdmin:
      return 'مدیر ارشد';
    case RoleType.Instructor:
      return 'مدرس';
    case RoleType.Student:
      return 'دانشجو';
    case RoleType.Operator:
      return 'اپراتور';
    case RoleType.OperatorAdmin:
      return 'مدیر اپراتور';
    default:
      return 'نامشخص';
  }
};

export const getRoleTypeFromString = (roleString: string): RoleType | null => {
  const roleMap: Record<string, RoleType> = {
    'super-admin': RoleType.SuperAdmin,
    'instructor': RoleType.Instructor,
    'student': RoleType.Student,
    'operator': RoleType.Operator,
    'operator-admin': RoleType.OperatorAdmin,
  };
  return roleMap[roleString] ?? null;
};

// User Invoice Management
export enum UpdateUserInvoiceActionType {
  UpdateInvoice = 1,
  UpdateInvoiceTransaction = 2,
  AdjustInstallmentDueDates = 3,
  RejectUserInvoice = 4,
}

export interface UpdateUserInvoicePayload {
  actionType: UpdateUserInvoiceActionType;
  valueId: string;
  isRejectedByAdmin: boolean;
  rejectedByAdminMessage: string;
}

// Purchased Courses Types
export interface PurchasedCoursesParams {
  CourseId?: string;
  UserId?: string;
  PageIndex: number;
  PageSize: number;
}

export interface CourseScheduleInfo {
  name: string;
  typeId: number;
  id: string;
}

export interface InvoiceInfo {
  price: number;
  paymentType: number;
  isSettled: boolean;
  hasAccess: boolean;
  upcomingDueTransaction: any | null;
  paidInstallmentCount: number;
  totalInstallmentCount: number;
  isRejectedByAdmin: boolean;
  rejectedByAdminMessage: string | null;
  id: string;
}

export interface PurchasedUserInfo {
  fullNameFa: string;
  imageUrl: string;
  id: string;
}

export interface CategoryInfo {
  name: string;
  id: string;
}

export interface PurchasedCourseItem {
  name: string;
  imageUrl: string;
  status: number;
  enrollmentCount: number;
  requiresIdentityVerification: boolean;
  category: CategoryInfo;
  invoice: InvoiceInfo;
  schedules: CourseScheduleInfo[];
  userInfo: PurchasedUserInfo;
  id: string;
}

export interface PurchasedCoursesData {
  items: PurchasedCourseItem[];
  totalCount: number;
}

export interface PurchasedCoursesResponse {
  courseCategories: CategoryInfo[];
  courses: PurchasedCoursesData;
}
