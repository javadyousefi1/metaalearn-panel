import { httpService } from './http.service';
import { CourseListResponse, CourseListParams, CreateCoursePayload, UpdateCoursePayload } from '@/types/course.types';

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

  /**
   * Create new course
   * @param data - Course creation data
   * @returns Promise<void>
   */
  create: async (data: CreateCoursePayload): Promise<void> => {
    await httpService.post('/Course/Create', data);
  },

  /**
   * Update existing course
   * @param data - Course update data
   * @returns Promise<void>
   */
  update: async (data: UpdateCoursePayload): Promise<void> => {
    await httpService.put('/Course/Update', data);
  },
};
