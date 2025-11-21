import { httpService } from './http.service';
import type {
  GetAllPaymentsParams,
  AllPaymentsResponse,
  VerifyPaymentPayload,
} from '@/types/payment.types';

/**
 * Payment Service
 *
 * Handles all API calls related to payments
 */
export const paymentService = {
  /**
   * Get all payments with pagination and filters
   */
  async getAll(params: GetAllPaymentsParams): Promise<AllPaymentsResponse> {
    const response = await httpService.get<AllPaymentsResponse>('/Payment/GetAll', { params });
    return response.data;
  },

  /**
   * Verify a payment
   */
  async verify(payload: VerifyPaymentPayload): Promise<void> {
    await httpService.put('/Payment/Verify', payload);
  },
};
