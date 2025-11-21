// Course-related type definitions

export interface CourseCategory {
  id: string;
  name: string;
}

export interface CourseInstructor {
  id: string;
  fullNameFa: string;
  imageUrl: string;
}

export interface CourseGalleryItem {
  id: string;
  shareableUrl: string;
  type: number;
  category: number;
}

export interface CourseFaq {
  index: number;
  question: string;
  answer: string;
}

export interface CourseInstallment {
  step: number;
  amount: number;
  dueTime: string; // ISO datetime string
}

export interface Course {
  id: string;
  categoryId?: string;
  category?: CourseCategory;
  name: string;
  type: number;
  status: number;
  paymentTypes: number[]; // Multi-select payment types
  price: number;
  isCertificateAvailable: boolean;
  isDraft?: boolean;
  isActive?: boolean;
  preRequisites: string;
  shortText: string;
  fullText?: string;
  intervalTime: string;
  durationTime: string;
  daysOfWeeks: number[];
  progressPercentage?: number;
  // Installment fields
  supportsInstallment?: boolean;
  installmentType?: number; // 0=None, 1=Auto, 2=Custom
  installmentCount?: number;
  minimumInstallmentToPay?: number;
  installmentInterval?: number; // Per day (for Auto mode)
  installments?: CourseInstallment[]; // For Custom mode
  discountPercentage?: number;
  requiresIdentityVerification?: boolean;
  enrollmentCount?: number;
  favoriteCount?: number;
  instructors?: CourseInstructor[];
  instructorIds?: string[];
  gallery?: CourseGalleryItem[];
  faqs?: CourseFaq[];
}

export interface CourseListParams {
  PageIndex: number;
  PageSize: number;
}

export interface CourseListResponse {
  items: Course[];
  totalCount: number;
}

export interface CreateCoursePayload {
  categoryId: string;
  name: string;
  type: number;
  status: number;
  paymentTypes: number[];
  price: number;
  isCertificateAvailable: boolean;
  isDraft?: boolean;
  preRequisites: string;
  intervalTime: string;
  durationTime: string;
  daysOfWeeks: number[];
  progressPercentage: number;
  // Installment fields
  installmentType?: number;
  installmentCount?: number;
  minimumInstallmentToPay?: number;
  installmentInterval?: number;
  installments?: CourseInstallment[];
  discountPercentage: number;
  requiresIdentityVerification?: boolean;
}

export interface UpdateCoursePayload {
  id: string;
  categoryId?: string;
  name?: string;
  type?: number;
  status?: number;
  paymentTypes?: number[];
  price?: number;
  isCertificateAvailable?: boolean;
  isDraft?: boolean;
  preRequisites?: string;
  shortText?: string;
  fullText?: string;
  intervalTime?: string;
  durationTime?: string;
  daysOfWeeks?: number[];
  progressPercentage?: number;
  // Installment fields
  installmentType?: number;
  installmentCount?: number;
  minimumInstallmentToPay?: number;
  installmentInterval?: number;
  installments?: CourseInstallment[];
  discountPercentage?: number;
  requiresIdentityVerification?: boolean;
  faqs?: CourseFaq[];
}
