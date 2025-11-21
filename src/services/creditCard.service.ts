import { httpService } from './http.service';
import { UpdateCreditCardIdentityPayload } from '@/types/user.types';

/**
 * Credit Card Service
 * Handles all credit card-related API calls
 */
class CreditCardService {
  private readonly baseUrl = '/UserCreditCard';

  /**
   * Update credit card identity status (verify or reject)
   */
  async updateIdentity(payload: UpdateCreditCardIdentityPayload): Promise<void> {
    await httpService.put(`/UserCreditCard/Identity`, payload);
  }
}

export const creditCardService = new CreditCardService();
