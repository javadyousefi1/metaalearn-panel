/**
 * Course Comment Types
 */

export interface CourseCommentUser {
  fullNameFa: string;
  imageUrl: string;
  id: string;
}

export interface CourseComment {
  user: CourseCommentUser;
  score: number;
  content: string;
  courseId: string;
  isApproved: boolean;
  parentId?: string | null;
  replies?: CourseComment[];
  id: string;
}

export interface CourseCommentsResponse {
  items: CourseComment[];
  totalCount: number;
}

export interface GetCourseCommentsParams {
  courseId: string;
  pageIndex?: number;
  pageSize?: number;
  isApproved?: boolean;
}

export interface UpdateCommentApprovalParams {
  state: boolean;
  id: string;
}

export interface CreateCommentReplyParams {
  content: string;
  courseId: string;
  parentId: string;
}
