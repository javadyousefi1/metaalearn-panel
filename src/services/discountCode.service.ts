import { httpService } from './http.service';
import type {
  GetAllDiscountCodesParams,
  AllDiscountCodesResponse,
  CreateDiscountCodePayload,
  UpdateDiscountCodePayload,
} from '@/types/discountCode.types';

export const discountCodeService = {
  async getAll(params?: GetAllDiscountCodesParams): Promise<AllDiscountCodesResponse> {
    const response = await httpService.get<AllDiscountCodesResponse>(
      '/PaymentDiscountCode/GetAll',
      { params },
    );
    return response.data;
  },

  async create(payload: CreateDiscountCodePayload): Promise<void> {
    await httpService.post('/PaymentDiscountCode/Create', payload);
  },

  async update(payload: UpdateDiscountCodePayload): Promise<void> {
    await httpService.put('/PaymentDiscountCode/Update', payload);
  },

  async delete(id: string): Promise<void> {
    await httpService.delete(`/PaymentDiscountCode/Delete/${id}`);
  },
};
