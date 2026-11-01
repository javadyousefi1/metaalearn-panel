import { httpService } from './http.service';
import type {
  AllBannersResponse,
  CreateBannerPayload,
  GetAllBannersParams,
  UpdateBannerPayload,
  UploadBannerImageResponse,
  BannerType,
} from '@/types/banner.types';

export const bannerService = {
  async getAll(params?: GetAllBannersParams): Promise<AllBannersResponse> {
    const response = await httpService.get<AllBannersResponse>('/Banner/GetAll', { params });
    return response.data;
  },

  async create(payload: CreateBannerPayload): Promise<void> {
    await httpService.post('/Banner/Create', payload);
  },

  async update(payload: UpdateBannerPayload): Promise<void> {
    await httpService.put('/Banner/Update', payload);
  },

  async delete(id: string): Promise<void> {
    await httpService.delete('/Banner/Delete', { params: { id } });
  },

  async uploadImage(file: File, type: BannerType): Promise<UploadBannerImageResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', String(type));

    const response = await httpService.post<UploadBannerImageResponse>(
      '/Banner/Upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    return response.data;
  },
};
