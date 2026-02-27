import { httpService } from './http.service';
import {
  CredentialExamListParams,
  CredentialExamListResponse,
  CreateCredentialExamPayload,
  UpdateCredentialExamPayload,
} from '@/types/exam.types';

export const examService = {
  getAll: async (params: CredentialExamListParams): Promise<CredentialExamListResponse> => {
    const response = await httpService.get<CredentialExamListResponse>('/CredentialExam/GetAll', { params });
    return response.data;
  },

  create: async (data: CreateCredentialExamPayload): Promise<void> => {
    await httpService.post('/CredentialExam/Create', data);
  },

  update: async (data: UpdateCredentialExamPayload): Promise<void> => {
    await httpService.put('/CredentialExam/Update', data);
  },

  delete: async (id: string): Promise<void> => {
    await httpService.delete(`/CredentialExam/Delete/${id}`);
  },
};
