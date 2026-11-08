import { httpService } from './http.service';
import { CourseListResponse, CourseListParams, CreateCoursePayload, UpdateCoursePayload, Course } from '@/types/course.types';
import { UploadClubImageRs, UploadClubImageType } from '@/types/courseClub.types';

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
   * Upload (or replace) a course club image. The backend saves it on the target.
   * @param courseId - The club course ID
   * @param type - Guest photo or playlist cover
   * @param targetId - A saved guest / playlist item id (from Course/Get)
   * @param file - JPEG or PNG image, max 10 MB
   */
  uploadClubImage: async (
    courseId: string,
    type: UploadClubImageType,
    targetId: string,
    file: File,
  ): Promise<UploadClubImageRs> => {
    const formData = new FormData();
    formData.append('courseId', courseId);
    formData.append('type', String(type));
    formData.append('targetId', targetId);
    formData.append('file', file);
    const response = await httpService.post<UploadClubImageRs>(
      '/Course/UploadClub',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data;
  },
};
