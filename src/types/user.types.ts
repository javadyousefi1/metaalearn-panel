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
}

export interface AllUsersResponse {
  items: UserListItem[];
  totalCount: number;
}
