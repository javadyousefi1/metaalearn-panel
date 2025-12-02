import { httpService } from './http.service';
import {
  CourseCommentsResponse,
  GetCourseCommentsParams,
  UpdateCommentApprovalParams,
} from '@/types/courseComment.types';

/**
 * Course Comment Service
 *
 * Handles all API calls related to course comments
 */
export const courseCommentService = {
  /**
   * Get all comments for a course with pagination
   * @param params - Course ID, pagination parameters, and approval status filter
   * @returns Promise with paginated comment list
   */
  getAll: async (params: GetCourseCommentsParams): Promise<CourseCommentsResponse> => {
    const { courseId, pageIndex = 1, pageSize = 10, isApproved } = params;
    let url = `/CourseComment/GetAll?CourseId=${courseId}&PageIndex=${pageIndex}&PageSize=${pageSize}`;

    // Add IsApproved filter if specified
    if (isApproved !== undefined) {
      url += `&IsApproved=${isApproved}`;
    }

    const response = await httpService.get<CourseCommentsResponse>(url);
    return response.data;
  },

  /**
   * Update comment approval status
   * @param params - Comment ID and approval state
   * @returns Promise<void>
   */
  updateApproval: async (params: UpdateCommentApprovalParams): Promise<void> => {
    await httpService.post('/CourseComment/Update', params);
  },
};
