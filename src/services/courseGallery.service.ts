import { httpService } from './http.service';
import {
  CourseGalleryListResponse,
  CourseGalleryListParams,
  UploadCourseGalleryPayload
} from '@/types/courseGallery.types';

/**
 * Course Gallery Service
 *
 * Handles all API calls related to course gallery (images/videos)
 */
export const courseGalleryService = {
  /**
   * Get all gallery items for a course
   * @param params - Query parameters (CourseId, PageIndex, PageSize)
   * @returns Promise with gallery list response
   */
  getAll: async (params: CourseGalleryListParams): Promise<CourseGalleryListResponse> => {
    const response = await httpService.get<CourseGalleryListResponse>(
      `/CourseGallery/GetAll`,
      { params }
    );
    return response.data;
  },

  /**
   * Upload (create or update) a gallery item
   * @param payload - Upload data including file, courseId, type, category, requestType
   * @returns Promise<void>
   */
  upload: async (payload: UploadCourseGalleryPayload): Promise<void> => {
    const formData = new FormData();
    formData.append('file', payload.file);

    await httpService.post('/CourseGallery/Upload', formData, {
      params: {
        courseId: payload.courseId,
        type: payload.type,
        category: payload.category,
        requestType: payload.requestType,
      },
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Delete a gallery item by ID
   * @param id - Gallery Item ID
   * @returns Promise<void>
   */
  delete: async (id: string): Promise<void> => {
    await httpService.delete(`/CourseGallery/Delete/${id}`);
  },
};
