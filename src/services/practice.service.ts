import { httpService } from './http.service';
import { PracticeListResponse, PracticeListParams, UpdatePracticeGradePayload } from '@/types/practice.types';

/**
 * Practice Service
 *
 * Handles all API calls related to course practice submissions
 */
export const practiceService = {
  /**
   * Get all practice submissions for a course
   * @param params - Course ID and pagination parameters
   * @returns Promise with paginated practice list
   */
  getAll: async (params: PracticeListParams): Promise<PracticeListResponse> => {
    const { CourseId, PageIndex = 1, PageSize = 100 } = params;
    const response = await httpService.get<PracticeListResponse>(
      `/CourseScheduleEnrollment/GetAll?CourseId=${CourseId}&PageIndex=${PageIndex}&PageSize=${PageSize}`
    );
    return response.data;
  },

  /**
   * Update practice grade
   * @param data - Practice grade update data
   * @returns Promise<void>
   */
  updateGrade: async (data: UpdatePracticeGradePayload): Promise<void> => {
    await httpService.post('/CourseScheduleEnrollment/Update', data);
  },

  /**
   * Reset practice grade
   * @param id - Practice submission ID
   * @returns Promise<void>
   */
  resetGrade: async (id: string): Promise<void> => {
    await httpService.post('/CourseScheduleEnrollment/Update', {
      id,
      resetUpload: true,
    });
  },
};
