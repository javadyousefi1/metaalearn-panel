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
  roles: string[];
  createdTime: string;
  updatedTime: string | null;
}

export interface GetAllUsersParams {
  PageIndex: number;
  PageSize: number;
  IncludeProfile?: boolean;
  IncludeIdentity?: boolean;
  IdentityStatus?: IdentityStatusType; // Filter by identity status
  PhoneNumber?: string; // Filter by phone number
  FullNameFa?: string; // Filter by full name (Persian)
  Role?: RoleType; // Filter by role
}

export interface AllUsersResponse {
  items: UserListItem[];
  totalCount: number;
}

// Identity Status Types
export enum IdentityStatusType {
  None = 0, // User just created!
  Requested = 1, // User requested identity verification
  Pending = 2, // Documents uploaded, waiting for admin verification
  Verified = 3, // Admin verified the documents
  Rejected = 4, // Admin rejected the documents
  Revoked = 5, // Verification was revoked by admin
}

export interface UpdateUserIdentityPayload {
  actionType: IdentityStatusType;
  userId: string;
  message?: string; // Optional, not needed for Verified status
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
