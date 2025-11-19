import { httpService } from './http.service';
import type { GetAllTicketsParams, AllTicketsResponse } from '@/types/ticket.types';

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
};
