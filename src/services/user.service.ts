import { httpService } from './http.service';
import { UserListResponse, UserListParams } from '@/types/courseSchedule.types';

/**
 * User Service
 *
 * Handles all API calls related to users
 */
export const userService = {
  /**
   * Get all users by role
   * @param params - Query parameters (role, PageIndex, PageSize, etc.)
   * @returns Promise with user list response
   */
  getAllByRole: async (params: UserListParams): Promise<UserListResponse> => {
    const response = await httpService.get<UserListResponse>(
      `/User/GetAll`,
      { params }
    );
    return response.data;
  },
};
