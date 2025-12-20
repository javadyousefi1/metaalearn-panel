import { httpService } from './http.service';
import { CourseSession, CreateSessionPayload, UpdateSessionPayload, SessionListResponse } from '@/types/session.types';

/**
 * Course Session Service
 *
 * Handles all API calls related to course sessions
 */
export const courseSessionService = {
  /**
   * Get all course sessions
   * @returns Promise with session list response
   */
  getAll: async (params): Promise<SessionListResponse> => {
      console.log(params)
    const response = await httpService.get<SessionListResponse>(
      `/CourseSession/GetAll` , {
          params
        }
    );
    return response.data;
  },

  /**
   * Get course session by ID
   * @param id - Course Session ID
   * @returns Promise with course session details
   */
  getById: async (id: string): Promise<CourseSession> => {
    const response = await httpService.get<CourseSession>(
      `/CourseSession/Get/${id}`
    );
    return response.data;
  },

  /**
   * Create new course session
   * @param data - Course session creation data
   * @returns Promise<void>
   */
  create: async (data: CreateSessionPayload): Promise<void> => {
    await httpService.post('/CourseSession/Create', data);
  },

  /**
   * Update existing course session
   * @param data - Course session update data
   * @returns Promise<void>
   */
  update: async (data: UpdateSessionPayload): Promise<void> => {
    await httpService.put('/CourseSession/Update', data);
  },

  /**
   * Delete course session by ID
   * @param id - Course Session ID
   * @returns Promise<void>
   */
  delete: async (id: string): Promise<void> => {
    await httpService.delete(`/CourseSession/Delete/${id}`);
  },

  /**
   * Upload file for course session
   * @param file - File to upload
   * @param courseSessionId - Course Session ID
   * @param uploadType - Upload type (1=Video, 2=File, 3=VideoCover)
   * @param onUploadProgress - Optional callback for upload progress
   * @returns Promise with file URL
   */
  upload: async (
    file: File,
    courseSessionId: string,
    uploadType: number,
    onUploadProgress?: (progress: number) => void
  ): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('courseSessionId', courseSessionId);
    formData.append('uploadType', uploadType.toString());

    // Don't set Content-Type header - the interceptor will handle it automatically with boundary
    const response = await httpService.post<{ url: string }>(
      '/CourseSession/Upload',
      formData,
      {
        timeout: 60 * 20 * 1000,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onUploadProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onUploadProgress(percentCompleted);
          }
        },
      }
    );
    return response.data;
  },
};
