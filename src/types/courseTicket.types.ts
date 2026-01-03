// Course Ticket Enums
export enum CourseTicketStatus {
  Open = 0,
  InProgress = 1,
  Answered = 2,
  Resolved = 3,
  Closed = 4,
}

export enum CourseTicketAttachmentType {
  Image = 0,
  Zip = 1,
}

// User Info
export interface CourseTicketUserInfo {
  fullNameFa: string;
  imageUrl: string;
  phoneNumber?: string;
  id: string;
}

// Course Ticket Item
export interface CourseTicketListItem {
  title: string;
  status: string;
  userInfo: CourseTicketUserInfo;
  courseId: string;
  courseScheduleId: string | null;
  createdTime: string;
  updatedTime: string | null;
  id: string;
}

// API Request/Response
export interface GetAllCourseTicketsParams {
  PageIndex: number;
  PageSize: number;
}

export interface AllCourseTicketsResponse {
  items: CourseTicketListItem[];
  totalCount: number;
}

// Helper functions for status display
export const getCourseTicketStatusName = (status: CourseTicketStatus | string): string => {
  if (typeof status === 'string') {
    switch (status) {
      case 'Open':
        return 'باز';
      case 'InProgress':
        return 'در حال بررسی';
      case 'Answered':
        return 'پاسخ داده شده';
      case 'Resolved':
        return 'حل شده';
      case 'Closed':
        return 'بسته شده';
      default:
        return 'نامشخص';
    }
  }

  switch (status) {
    case CourseTicketStatus.Open:
      return 'باز';
    case CourseTicketStatus.InProgress:
      return 'در حال بررسی';
    case CourseTicketStatus.Answered:
      return 'پاسخ داده شده';
    case CourseTicketStatus.Resolved:
      return 'حل شده';
    case CourseTicketStatus.Closed:
      return 'بسته شده';
    default:
      return 'نامشخص';
  }
};

export const getCourseTicketStatusColor = (status: CourseTicketStatus | string): string => {
  if (typeof status === 'string') {
    switch (status) {
      case 'Open':
        return 'blue';
      case 'InProgress':
        return 'orange';
      case 'Answered':
        return 'cyan';
      case 'Resolved':
        return 'green';
      case 'Closed':
        return 'default';
      default:
        return 'default';
    }
  }

  switch (status) {
    case CourseTicketStatus.Open:
      return 'blue';
    case CourseTicketStatus.InProgress:
      return 'orange';
    case CourseTicketStatus.Answered:
      return 'cyan';
    case CourseTicketStatus.Resolved:
      return 'green';
    case CourseTicketStatus.Closed:
      return 'default';
    default:
      return 'default';
  }
};

// Course Ticket Message Types
export interface CourseTicketMessageUserInfo {
  fullNameFa: string;
  imageUrl: string;
  id: string;
}

export interface CourseTicketMessageAttachment {
  url: string;
  type: CourseTicketAttachmentType;
  id: string;
}

export interface CourseTicketMessage {
  courseTicketId: string;
  content: string;
  userInfo: CourseTicketMessageUserInfo;
  isOperator: boolean;
  attachments: CourseTicketMessageAttachment[];
  createdTime: string;
  updatedTime: string | null;
  id: string;
}

export interface GetAllCourseTicketMessagesParams {
  CourseTicketId: string;
  PageIndex: number;
  PageSize: number;
}

export interface AllCourseTicketMessagesResponse {
  items: CourseTicketMessage[];
  totalCount: number;
}

// Create Course Ticket Message Types
export interface CreateCourseTicketMessagePayload {
  courseTicketId: string;
  content: string;
  files?: File[];
}

// Update Course Ticket Message Types
export interface UpdateCourseTicketMessagePayload {
  id: string;
  content: string;
  files?: File[];
}

// Update Course Ticket Types
export interface UpdateCourseTicketPayload {
  id: string;
  title?: string;
  status?: CourseTicketStatus;
  score?: number;
  closeMessage?: string;
}

// Course Info
export interface CourseTicketCourse {
  name: string;
  imageUrl: string | null;
  id: string;
}

// Course Schedule Info
export interface CourseTicketSchedule {
  name: string;
  id: string;
}

// Course Ticket Detail Types
export interface CourseTicketDetail {
  title: string;
  status: number;
  userInfo: CourseTicketUserInfo;
  course: CourseTicketCourse | null;
  courseSchedule: CourseTicketSchedule | null;
  score: number | null;
  createdTime: string;
  updatedTime: string;
  id: string;
}
