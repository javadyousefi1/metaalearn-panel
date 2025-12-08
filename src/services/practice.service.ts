import { httpService } from './http.service';
import { PracticeListResponse, PracticeListParams, UpdatePracticeGradePayload, UpdateEnrollmentActionType } from '@/types/practice.types';

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
      `/CourseSessionEnrollment/GetAll`, { params }
    );
    return response.data;
  },

  /**
   * Update practice grade
   * @param data - Practice grade update data
   * @returns Promise<void>
   */
  updateGrade: async (data: Omit<UpdatePracticeGradePayload, 'actionType'>): Promise<void> => {
    await httpService.post('/CourseSessionEnrollment/Update', {
      ...data,
      actionType: UpdateEnrollmentActionType.SetGrade,
    });
  },

  /**
   * Reset practice grade and upload (ResetBoth)
   * @param id - Practice submission ID
   * @returns Promise<void>
   */
  resetGrade: async (id: string): Promise<void> => {
    await httpService.post('/CourseSessionEnrollment/Update', {
      id,
      actionType: UpdateEnrollmentActionType.ResetBoth,
      grade: 0,
      feedback: '',
    });
  },
};
