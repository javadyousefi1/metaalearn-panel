import { httpService } from './http.service';
import type {
  CreateSubscriptionPayload,
  UpdateSubscriptionPayload,
  GetAllSubscriptionsParams,
  AllSubscriptionsResponse,
  GetAllPurchasedSubscriptionsParams,
  AllPurchasedSubscriptionsResponse,
} from '@/types/subscription.types';

export const subscriptionService = {
  async getAll(params?: GetAllSubscriptionsParams): Promise<AllSubscriptionsResponse> {
    const response = await httpService.get<AllSubscriptionsResponse>('/Subscription/GetAll', { params });
    return response.data;
  },

  async create(payload: CreateSubscriptionPayload): Promise<void> {
    await httpService.post('/Subscription/Create', payload);
  },

  async update(payload: UpdateSubscriptionPayload): Promise<void> {
    await httpService.put('/Subscription/Update', payload);
  },

  async delete(id: string): Promise<void> {
    await httpService.delete('/Subscription/Delete', { params: { id } });
  },

  async getAllPurchased(params?: GetAllPurchasedSubscriptionsParams): Promise<AllPurchasedSubscriptionsResponse> {
    const response = await httpService.get<AllPurchasedSubscriptionsResponse>(
      '/User/GetAllPurchasedSubscriptions',
      { params }
    );
    return response.data;
  },
};
