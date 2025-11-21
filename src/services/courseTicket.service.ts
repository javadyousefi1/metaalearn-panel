import { httpService } from './http.service';
import type {
  GetAllCourseTicketsParams,
  AllCourseTicketsResponse,
  GetAllCourseTicketMessagesParams,
  AllCourseTicketMessagesResponse,
  CreateCourseTicketMessagePayload,
  UpdateCourseTicketMessagePayload,
} from '@/types/courseTicket.types';

/**
 * Course Ticket Service
 *
 * Handles all API calls related to course tickets (operator tickets)
 */
export const courseTicketService = {
  /**
   * Get all course tickets with pagination
   */
  async getAll(params: GetAllCourseTicketsParams): Promise<AllCourseTicketsResponse> {
    const response = await httpService.get<AllCourseTicketsResponse>('/CourseTicket/GetAll', { params });
    return response.data;
  },

  /**
   * Get all messages for a specific course ticket
   */
  async getAllMessages(params: GetAllCourseTicketMessagesParams): Promise<AllCourseTicketMessagesResponse> {
    const response = await httpService.get<AllCourseTicketMessagesResponse>('/CourseTicketMessage/GetAll', { params });
    return response.data;
  },

  /**
   * Create a new course ticket message
   */
  async createMessage(payload: CreateCourseTicketMessagePayload): Promise<void> {
    const formData = new FormData();
    formData.append('courseTicketId', payload.courseTicketId);
    formData.append('content', payload.content);

    if (payload.files && payload.files.length > 0) {
      payload.files.forEach((file) => {
        formData.append('files', file);
      });
    }

    await httpService.post('/CourseTicketMessage/Create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Update a course ticket message
   */
  async updateMessage(payload: UpdateCourseTicketMessagePayload): Promise<void> {
    const formData = new FormData();
    formData.append('id', payload.id);
    formData.append('content', payload.content);

    if (payload.files && payload.files.length > 0) {
      payload.files.forEach((file) => {
        formData.append('files', file);
      });
    }

    await httpService.put('/CourseTicketMessage/Update', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Delete a course ticket message
   */
  async deleteMessage(id: string): Promise<void> {
    await httpService.delete('/CourseTicketMessage/Delete', {
      params: { id },
    });
  },
};
