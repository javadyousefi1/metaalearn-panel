import { httpService } from './http.service';
import type {
  GetAllPaymentInstructionsParams,
  AllPaymentInstructionsResponse,
  CreatePaymentInstructionPayload,
  UpdatePaymentInstructionPayload,
  DeletePaymentInstructionParams,
} from '@/types/paymentInstruction.types';

/**
 * Payment Instruction Service
 *
 * Handles all API calls related to payment instructions (cards)
 */
export const paymentInstructionService = {
  /**
   * Get all payment instructions with pagination
   */
  async getAll(params: GetAllPaymentInstructionsParams): Promise<AllPaymentInstructionsResponse> {
    const response = await httpService.get<AllPaymentInstructionsResponse>(
      '/PaymentInstruction/GetAll',
      { params }
    );
    return response.data;
  },

  /**
   * Create a new payment instruction
   */
  async create(payload: CreatePaymentInstructionPayload): Promise<void> {
    await httpService.post('/PaymentInstruction/Create', payload);
  },

  /**
   * Update an existing payment instruction
   */
  async update(payload: UpdatePaymentInstructionPayload): Promise<void> {
    await httpService.put('/PaymentInstruction/Update', payload);
  },

  /**
   * Delete a payment instruction
   */
  async delete(params: DeletePaymentInstructionParams): Promise<void> {
    await httpService.delete('/PaymentInstruction/Delete', { params });
  },
};
