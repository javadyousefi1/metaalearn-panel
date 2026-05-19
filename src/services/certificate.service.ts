import { httpService } from './http.service';
import type {
  GetAllCertificatesParams,
  AllCertificatesResponse,
  UpdateCertificatePayload,
} from '@/types/certificate.types';

export const certificateService = {
  async getAll(params: GetAllCertificatesParams): Promise<AllCertificatesResponse> {
    const response = await httpService.get<AllCertificatesResponse>(
      '/Certificate/GetAll',
      { params },
    );
    return response.data;
  },

  async update(payload: UpdateCertificatePayload): Promise<void> {
    await httpService.put('/Certificate/Update', payload);
  },
};
