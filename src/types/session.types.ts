// Course Session-related type definitions

export interface CourseSession {
  id: string;
  course: {
    name: string;
    id: string;
  } | null;
  name: string;
  description: string;
  index: number;
  occurrenceTime: string;
  practiceDueTime: string;
  videoUrl: string;
  videoCoverUrl: string | null;
  fileUrl: string;
  onlineMeetingUrl: string;
  parentId: string | null;
  parentName: string | null;
  subSessions: CourseSession[] | null;
  isPracticeAvailable: boolean;
  isTopic: boolean;
  createdTime: string;
  updatedTime: string | null;
}

export interface CreateSessionPayload {
  courseId: string;
  name: string;
  description: string;
  index: number;
  occurrenceTime: string;
  practiceDueTime: string;
  videoUrl: string;
  fileUrl: string;
  onlineMeetingUrl: string;
  parentId: string | null;
  isPracticeAvailable: boolean;
  isTopic: boolean;
}

export interface UpdateSessionPayload {
  id: string;
  courseId: string;
  name: string;
  description: string;
  index: number;
  occurrenceTime: string;
  practiceDueTime: string;
  videoUrl: string;
  fileUrl: string;
  onlineMeetingUrl: string;
  parentId: string | null;
  isPracticeAvailable: boolean;
  isTopic: boolean;
}

export interface SessionListResponse {
  items: CourseSession[];
  totalCount: number;
}
