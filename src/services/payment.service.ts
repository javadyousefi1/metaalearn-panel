import { httpService } from './http.service';
import type {
  GetAllPaymentsParams,
  AllPaymentsResponse,
  VerifyPaymentPayload,
  RejectPaymentPayload,
  RefundPaymentPayload,
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

  /**
   * Reject a payment
   */
  async reject(payload: RejectPaymentPayload): Promise<void> {
    await httpService.put('/Payment/Reject', payload);
  },

  /**
   * Refund a payment by admin
   */
  async refund(payload: RefundPaymentPayload): Promise<void> {
    await httpService.post('/Management/RefundPaymentByAdmin', {
      paymentId: payload.paymentId,
      refundedMessage: payload.refundedMessage,
    });
  },
};
