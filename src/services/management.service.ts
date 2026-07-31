import { httpService, streamerHttpService } from './http.service';
import {
  RegisterUsersToCourseRqDto,
  RegisterUsersToCourseRsDto,
  SwapPhoneNumberPayload,
} from '@/types/management.types';
import { CheckVideoIntegrityResponse, RencodeVideosType } from '@/types/session.types';

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

  /**
   * Swap user phone number
   * @param data - Swap data (userId, targetPhoneNumber, forceExchange)
   * @returns Promise<void>
   */
  swapPhoneNumber: async (data: SwapPhoneNumberPayload): Promise<void> => {
    await httpService.post('/Management/SwapPhoneNumber', data);
  },

  /**
   * Enqueue a background job that renews (re-encodes) every video of a course
   * @param courseId - Course ID
   * @returns Promise<void>
   */
  renewCourseVideos: async (courseId: string): Promise<void> => {
    await streamerHttpService.post('/Management/Rencode', {
      type: RencodeVideosType.Course,
      id: courseId,
    });
  },

  /**
   * Enqueue a background job that renews (re-encodes) a single session's video
   * @param courseSessionId - Course Session ID
   * @returns Promise<void>
   */
  renewSessionVideo: async (courseSessionId: string): Promise<void> => {
    await streamerHttpService.post('/Management/Rencode', {
      type: RencodeVideosType.CourseSession,
      id: courseSessionId,
    });
  },

  /**
   * Check a single session's video health (manifest + segments present in storage)
   * @param courseSessionId - Course Session ID
   * @returns Promise with the health check result
   */
  checkSessionVideoIntegrity: async (
    courseSessionId: string
  ): Promise<CheckVideoIntegrityResponse> => {
    const response = await streamerHttpService.post<CheckVideoIntegrityResponse>(
      '/Management/CheckHealth',
      { id: courseSessionId }
    );
    return response.data;
  },
};
