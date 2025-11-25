// Practice-related type definitions

export enum UpdateEnrollmentActionType {
  ResetUpload = 1,
  ResetGrade = 2,
  ResetBoth = 3,
  SetGrade = 4
}

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
  actionType: UpdateEnrollmentActionType;
  grade?: number;
  feedback?: string;
}
