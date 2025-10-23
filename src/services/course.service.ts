import { httpService } from './http.service';
import { CourseListResponse, CourseListParams } from '@/types/course.types';

/**
 * Course Service
 *
 * Handles all API calls related to courses
 */
export const courseService = {
  /**
   * Get all courses with pagination
   * @param params - Pagination parameters (PageIndex, PageSize)
   * @returns Promise with paginated course list
   */
  getAll: async (params: CourseListParams): Promise<CourseListResponse> => {
    const { PageIndex, PageSize } = params;
    const response = await httpService.get<CourseListResponse>(
      `/Course/GetAll?PageIndex=${PageIndex}&PageSize=${PageSize}`
    );
    return response.data;
  },
};
