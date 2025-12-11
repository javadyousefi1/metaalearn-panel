// Course Schedule-related type definitions

export interface ScheduleUser {
  id: string;
  fullNameFa: string;
  imageUrl: string;
}

export interface CourseSummary {
  id: string;
  name: string;
}

export interface CourseSchedule {
  id: string;
  course: CourseSummary;
  name: string;
  description: string;
  isVisible: boolean;
  status: number;
  typeId?: number;
  onlineMeetingUrl?: string;
  instructors: ScheduleUser[];
  operators: ScheduleUser[];
  students: ScheduleUser[];
  createdTime: string;
  updatedTime: string;
}

export interface CreateCourseSchedulePayload {
  courseId: string;
  name: string;
  description: string;
  isVisible: boolean;
  status: number;
  typeId?: number;
  onlineMeetingUrl?: string;
  instructorIds: string[];
  operatorIds: string[];
  studentIds: string[];
}

export interface UpdateCourseSchedulePayload {
  id: string;
  courseId?: string;
  name?: string;
  description?: string;
  isVisible?: boolean;
  status?: number;
  typeId?: number;
  onlineMeetingUrl?: string;
  instructorIds?: string[];
  operatorIds?: string[];
  studentIds?: string[];
}

export interface CourseScheduleListParams {
  CourseId?: string;
  PageIndex: number;
  PageSize: number;
}

export interface CourseScheduleListResponse {
  items: CourseSchedule[];
  totalCount: number;
}

// User types for selection
export interface UserForSelection {
  id: string;
  fullNameFa: string;
  imageUrl?: string;
  email?: string;
}

export interface UserListParams {
  IncludeProfile?: boolean;
  IncludeIdentity?: boolean;
  PageIndex: number;
  PageSize: number;
  role: 'instructor' | 'student' | 'operator';
}

export interface UserListResponse {
  items: UserForSelection[];
  totalCount: number;
}
