export enum SubscriptionValueIdType {
  Course = 1,
}

export interface CourseInfo {
  id: string;
  name: string;
  imageUrl?: string | null;
}

export interface CreateSubscriptionPayload {
  name: string;
  description?: string | null;
  price: number;
  periodDays: number;
  isActive: boolean;
  valueIdType: SubscriptionValueIdType;
  valueIds: string[];
}

export interface UpdateSubscriptionPayload extends CreateSubscriptionPayload {
  id: string;
}

export interface GetAllSubscriptionsParams {
  PageIndex?: number;
  PageSize?: number;
  Name?: string;
  IsActive?: boolean;
  ValueType?: SubscriptionValueIdType;
  CourseId?: string;
}

export interface SubscriptionPlanValueInfo {
  courses?: CourseInfo[] | null;
}

export interface SubscriptionListItem {
  id: string;
  name: string;
  description: string;
  price: number;
  periodDays: number;
  isActive: boolean;
  valueType: SubscriptionValueIdType;
  valueInfo: SubscriptionPlanValueInfo | null;
  createdTime: string | null;
  updatedTime: string | null;
}

export interface AllSubscriptionsResponse {
  items: SubscriptionListItem[];
  totalCount: number;
}

export interface GetAllPurchasedSubscriptionsParams {
  PageIndex?: number;
  PageSize?: number;
  SubscriptionId?: string;
  UserId?: string;
  UserPhoneNumber?: string;
  UserFullName?: string;
}

export interface PurchasedSubscriptionInvoice {
  id: string;
  price: number;
  isSettled: boolean;
  hasAccess: boolean;
  isRejectedByAdmin: boolean;
  rejectedByAdminMessage: string | null;
  accessStartTime: string | null;
  accessEndTime: string | null;
}

export interface PurchasedSubscription {
  id: string;
  name: string;
  description: string;
  price: number;
  periodDays: number;
  courses: CourseInfo[];
  invoice: PurchasedSubscriptionInvoice;
  userInfo?: { id: string; fullNameFa: string | null; imageUrl: string | null } | null;
}

export interface AllPurchasedSubscriptionsResponse {
  items: PurchasedSubscription[];
  totalCount: number;
}
