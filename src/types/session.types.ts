// Course Session-related type definitions

export interface OnlineMeetingUrl {
  scheduleId: string;
  url: string;
}

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
  onlineMeetingUrls: OnlineMeetingUrl[] | null;
  parentId: string | null;
  parentName: string | null;
  subSessions: CourseSession[] | null;
  isPracticeAvailable: boolean;
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
  onlineMeetingUrls?: OnlineMeetingUrl[];
  parentId: string | null;
  isPracticeAvailable: boolean;
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
  onlineMeetingUrls?: OnlineMeetingUrl[];
  parentId: string | null;
  isPracticeAvailable: boolean;
}

export interface SessionListResponse {
  items: CourseSession[];
  totalCount: number;
}
