export interface CredentialExamQuestion {
  index: number;
  questionText: string;
  answers: string[];
  correctAnswerIndex: number;
}

export interface CredentialExamSchedule {
  name: string;
  typeId: number;
  id: string;
}

export interface CredentialExam {
  course: null;
  schedules: CredentialExamSchedule[];
  description: string;
  type: number;
  isCountedInDegree: boolean;
  timeWindowLimit: number;
  hasOccurrenceTimeWindow: boolean;
  occurrenceStartTime: string;
  occurrenceEndTime: string;
  questions: CredentialExamQuestion[];
  submissions: any[];
  createdTime: string;
  updatedTime: string;
  id: string;
}

export interface CredentialExamListParams {
  CourseId: string;
  ExamType?: number;
}

export interface CredentialExamListResponse {
  items: CredentialExam[];
  totalCount: number;
}

export interface CreateCredentialExamPayload {
  courseId: string;
  courseScheduleIds: string[];
  questions: CredentialExamQuestion[];
  isCountedInDegree: boolean;
  timeWindowLimit: number;
  hasOccurrenceTimeWindow: boolean;
  occurrenceStartTime: string;
  occurrenceEndTime: string;
  examType: number;
  description: string;
}

export interface UpdateCredentialExamPayload {
  id: string;
  courseScheduleIds: string[];
  questions: CredentialExamQuestion[];
  isCountedInDegree: boolean;
  timeWindowLimit: number;
  hasOccurrenceTimeWindow: boolean;
  occurrenceStartTime: string;
  occurrenceEndTime: string;
  examType: number | null;
  description: string;
}
