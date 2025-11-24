// Practice-related type definitions

export interface PracticeSubmission {
  id: string;
  courseId: string;
  courseScheduleId: string;
  userId: string;
  userInfo: {
    id: string;
    fullNameFa: string;
    imageUrl?: string;
  };
  practiceFileUrl?: string;
  uploadedTime?: string;
  grade?: number | null;
  notes?: string;
  feedback?: string;
}

export interface PracticeListParams {
  CourseId: string;
  PageIndex?: number;
  PageSize?: number;
}

export interface PracticeListResponse {
  items: PracticeSubmission[];
  totalCount: number;
}

export interface UpdatePracticeGradePayload {
  id: string;
  grade?: number | null;
  feedback?: string;
}
