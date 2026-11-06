import { httpService } from './http.service';
import { CourseListResponse, CourseListParams, CreateCoursePayload, UpdateCoursePayload, Course } from '@/types/course.types';
import { UploadClubGuestImageRs } from '@/types/courseClub.types';

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
      console.log(params , "xxx");
    const response = await httpService.get<CourseListResponse>(
      `/Course/GetAll` ,{params}
    );
    return response.data;
  },

  /**
   * Get course by ID
   * @param id - Course ID
   * @returns Promise with course details
   */
  getById: async (id: string): Promise<Course> => {
    const response = await httpService.get<Course>(
      `/Course/Get?Id=${id}`
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

  /**
   * Upload (or replace) a course club guest photo
   * @param courseId - The club course ID
   * @param guestId - A saved guest id (from Course/Get)
   * @param file - JPEG or PNG image
   */
  uploadClubGuestImage: async (
    courseId: string,
    guestId: string,
    file: File,
  ): Promise<UploadClubGuestImageRs> => {
    const formData = new FormData();
    formData.append('courseId', courseId);
    formData.append('guestId', guestId);
    formData.append('file', file);
    const response = await httpService.post<UploadClubGuestImageRs>(
      '/Course/UploadClubGuestImage',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data;
  },
};
