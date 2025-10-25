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

export interface Course {
  id: string;
  categoryId?: string;
  category?: CourseCategory;
  name: string;
  type: number;
  status: number;
  paymentMethod: number;
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
  installmentCount?: number;
  minimumInstallmentCount?: number;
  discountPercentage?: number;
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
  paymentMethod: number;
  price: number;
  isCertificateAvailable: boolean;
  preRequisites: string;
  intervalTime: string;
  durationTime: string;
  daysOfWeeks: number[];
  progressPercentage: number;
  installmentCount: number;
  minimumInstallmentCount: number;
  discountPercentage: number;
}

export interface UpdateCoursePayload {
  id: string;
  categoryId: string;
  name: string;
  type: number;
  status: number;
  paymentMethod: number;
  price: number;
  isCertificateAvailable: boolean;
  preRequisites: string;
  intervalTime?: string;
  durationTime?: string;
  daysOfWeeks?: number[];
  progressPercentage?: number;
  installmentCount?: number;
  minimumInstallmentCount?: number;
  discountPercentage?: number;
  faqs?: CourseFaq[];
}
