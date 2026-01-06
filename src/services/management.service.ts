import { httpService } from './http.service';
import {
  RegisterUsersToCourseRqDto,
  RegisterUsersToCourseRsDto,
} from '@/types/management.types';

/**
 * Management Service
 *
 * Handles all API calls related to management operations
 */
export const managementService = {
  /**
   * Register users to a course
   * @param data - Registration data (courseId and users list)
   * @returns Promise with registration result
   */
  registerUsersToCourse: async (
    data: RegisterUsersToCourseRqDto
  ): Promise<RegisterUsersToCourseRsDto> => {
    const response = await httpService.post<RegisterUsersToCourseRsDto>(
      '/Management/RegisterUsersToCourse',
      data
    );
    return response.data;
  },
};
