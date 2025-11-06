import { httpService } from './http.service';
import { UserListResponse, UserListParams } from '@/types/courseSchedule.types';
import { GetAllUsersParams, AllUsersResponse } from '@/types/user.types';

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

  /**
   * Get all users without role filter
   * @param params - Query parameters (PageIndex, PageSize, IncludeProfile, IncludeIdentity)
   * @returns Promise with user list response
   */
  getAll: async (params: GetAllUsersParams): Promise<AllUsersResponse> => {
    const response = await httpService.get<AllUsersResponse>(
      `/User/GetAll`,
      { params }
    );
    return response.data;
  },
};
