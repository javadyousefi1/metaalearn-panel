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
  hasVideo: boolean;
  fileUrl: string;
  onlineMeetingUrl: string;
  parentId: string | null;
  parentName: string | null;
  subSessions: CourseSession[] | null;
  isPracticeAvailable: boolean;
  isTopic: boolean;
  createdTime: string;
  updatedTime: string | null;
  // At most one entry per type (Upload/ReEncode) - each pipeline's own run is tracked
  // independently instead of one overwriting the other. Empty/undefined for non-backoffice callers.
  videoProcessingLogs?: CourseSessionVideoProcessing[];
}

export type VideoProcessingLogType = 'None' | 'Upload' | 'ReEncode';
export type VideoProcessingStatusValue = 'None' | 'Queued' | 'Processing' | 'Ready' | 'Failed';

export interface CourseSessionVideoProcessing {
  type: VideoProcessingLogType;
  status: VideoProcessingStatusValue;
  stage: string | null;
  error: string | null;
  startTime: string | null;
  endTime: string | null;
}

export enum CourseSessionUploadType {
  Video = 1,
  File = 2,
  VideoCover = 3,
}

export interface CheckVideoIntegrityResponse {
  courseSessionId: string;
  hasVideo: boolean;
  manifestExists: boolean;
  isHealthy: boolean;
  expectedSegmentCount: number;
  missingSegmentIndexes: number[];
  errorMessage: string | null;
  checkedAtUtc: string;
}

export interface VideoProcessingStatusResponse extends CourseSessionVideoProcessing {
  hasVideo: boolean;
}

export enum RencodeVideosType {
  Course = 1,
  CourseSession = 2,
}

export interface RencodeVideosRequest {
  type: RencodeVideosType;
  id: string;
}

export interface RencodeVideoResponse {
  courseSessionId: string;
  manifestPath: string;
  videoWidth: number | null;
  videoHeight: number | null;
  bandwidth: number;
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
