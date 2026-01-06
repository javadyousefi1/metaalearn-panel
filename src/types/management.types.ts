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
