import { httpService } from './http.service';
import type {
  GetAllTicketsParams,
  AllTicketsResponse,
  GetAllTicketMessagesParams,
  AllTicketMessagesResponse,
  CreateTicketMessagePayload,
  UpdateTicketMessagePayload,
  UpdateTicketPayload,
  TicketDetail,
} from '@/types/ticket.types';

/**
 * Ticket Service
 *
 * Handles all API calls related to tickets
 */
export const ticketService = {
  /**
   * Get all tickets with pagination
   */
  async getAll(params: GetAllTicketsParams): Promise<AllTicketsResponse> {
    const resposne = await httpService.get<AllTicketsResponse>('/Ticket/GetAll', { params });
    return resposne.data
  },

  /**
   * Get ticket details by ID
   */
  async get(id: string): Promise<TicketDetail> {
    const response = await httpService.get<TicketDetail>(`/Ticket/Get/${id}`);
    return response.data;
  },

  /**
   * Get all messages for a specific ticket
   */
  async getAllMessages(params: GetAllTicketMessagesParams): Promise<AllTicketMessagesResponse> {
    const response = await httpService.get<AllTicketMessagesResponse>('/TicketMessage/GetAll', { params });
    return response.data;
  },

  /**
   * Create a new ticket message
   */
  async createMessage(payload: CreateTicketMessagePayload): Promise<void> {
    const formData = new FormData();
    formData.append('ticketId', payload.ticketId);
    formData.append('content', payload.content);

    if (payload.files && payload.files.length > 0) {
      payload.files.forEach((file) => {
        formData.append('files', file);
      });
    }

    await httpService.post('/TicketMessage/Create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Update a ticket message
   */
  async updateMessage(payload: UpdateTicketMessagePayload): Promise<void> {
    const formData = new FormData();
    formData.append('id', payload.id);
    formData.append('content', payload.content);

    if (payload.files && payload.files.length > 0) {
      payload.files.forEach((file) => {
        formData.append('files', file);
      });
    }

    await httpService.put('/TicketMessage/Update', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Delete a ticket message
   */
  async deleteMessage(id: string): Promise<void> {
    await httpService.delete('/TicketMessage/Delete', {
      params: { id },
    });
  },

  /**
   * Update a ticket (e.g., change status)
   */
  async update(payload: UpdateTicketPayload): Promise<void> {
    await httpService.put('/Ticket/Update', payload);
  },
};
