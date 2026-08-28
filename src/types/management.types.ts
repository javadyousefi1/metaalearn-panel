/**
 * Management Types
 * Types for management operations like registering users to courses
 */

export interface RegisterUserToCourseDto {
  phoneNumber: string;
  firstNameFa: string;
  lastNameFa: string;
  isFullyPayment?: boolean;
  paidInstallmentSteps?: number;
}

export interface RegisterUsersToCourseRqDto {
  courseId: string;
  users: RegisterUserToCourseDto[];
}

export interface RegisterUsersToCourseRsDto {
  totalRows: number;
  enqueuedCount: number;
  failureCount: number;
  errors: string[];
}

export interface SwapPhoneNumberPayload {
  userId: string;
  targetPhoneNumber: string;
  forceExchange: boolean;
}

export interface SyncCourseSessionEnrollmentsPayload {
  scheduleId: string;
  syncAllStudents: boolean;
  studentIds?: string[];
}

export interface SyncCourseSessionEnrollmentsResponse {
  message: string;
  scheduleId: string;
  studentsProcessed: number;
  studentsAddedToSchedule: number;
  enrollmentsCreated: number;
  enrollmentsRestored: number;
  sessionsCount: number;
}
