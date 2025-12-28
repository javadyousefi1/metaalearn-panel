/**
 * Notification Type Enum
 */
export enum NotificationType {
  General = 0 ,
  Financial = 1,
  LoginInfo = 2,
  ClassFormation = 3,
}

/**
 * Notification type labels in Persian
 */
export const NotificationTypeLabels = {
  [NotificationType.General]: 'عمومی',
  [NotificationType.Financial]: 'مالی',
  [NotificationType.LoginInfo]: 'اطلاعات ورود',
  [NotificationType.ClassFormation]: 'تشکیل کلاس',
} as const;

/**
 * Payload for creating a notification
 */
export interface CreateNotificationPayload {
  userIds: string[];
  courseId?: string;
  courseScheduleId?: string;
  title: string;
  message: string;
  type: NotificationType;
  isForce: boolean;
  allUsers?: boolean;
}

/**
 * Notification item (if needed for listing)
 */
export interface Notification {
  id: string;
  userIds: string[];
  courseId?: string;
  courseScheduleId?: string;
  title: string;
  message: string;
  type: NotificationType;
  isForce: boolean;
  createdAt?: string;
}
