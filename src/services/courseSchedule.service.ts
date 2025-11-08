import { httpService } from './http.service';
import {
  CourseSchedule,
  CreateCourseSchedulePayload,
  UpdateCourseSchedulePayload,
  CourseScheduleListResponse,
  CourseScheduleListParams
} from '@/types/courseSchedule.types';

/**
 * Course Schedule Service
 *
 * Handles all API calls related to course schedules
 */
export const courseScheduleService = {
  /**
   * Get all course schedules with optional filters
   * @param params - Query parameters (CourseId, PageIndex, PageSize)
   * @returns Promise with schedule list response
   */
  getAll: async (params?: CourseScheduleListParams): Promise<CourseScheduleListResponse> => {
    const response = await httpService.get<CourseScheduleListResponse>(
      `/CourseSchedule/GetAll`,
      { params }
    );
    return response.data;
  },

  /**
   * Get course schedule by ID
   * @param id - Course Schedule ID
   * @returns Promise with course schedule details
   */
  getById: async (id: string): Promise<CourseSchedule> => {
    const response = await httpService.get<CourseSchedule>(
      `/CourseSchedule/Get/${id}`
    );
    return response.data;
  },

  /**
   * Create new course schedule
   * @param data - Course schedule creation data
   * @returns Promise<void>
   */
  create: async (data: CreateCourseSchedulePayload): Promise<void> => {
    await httpService.post('/CourseSchedule/Create', data);
  },

  /**
   * Update existing course schedule
   * @param data - Course schedule update data
   * @returns Promise<void>
   */
  update: async (data: UpdateCourseSchedulePayload): Promise<void> => {
    await httpService.put('/CourseSchedule/Update', data);
  },

  /**
   * Delete course schedule by ID
   * @param id - Course Schedule ID
   * @returns Promise<void>
   */
  delete: async (id: string): Promise<void> => {
    await httpService.delete(`/CourseSchedule/Delete/${id}`);
  },
};
