import { httpService } from './http.service';
import { UserListResponse, UserListParams } from '@/types/courseSchedule.types';
import { GetAllUsersParams, AllUsersResponse, UpdateUserIdentityPayload, RoleManagementPayload, PurchasedCoursesParams, PurchasedCoursesResponse } from '@/types/user.types';

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

  /**
   * Update user identity status
   * @param payload - Identity update data (actionType, userId, message)
   * @returns Promise<void>
   */
  updateIdentity: async (payload: UpdateUserIdentityPayload): Promise<void> => {
    await httpService.put('/User/Identity', payload);
  },

  /**
   * Manage user roles (assign or unassign)
   * @param payload - Role management data (userId, roleType, isAssign)
   * @returns Promise<void>
   */
  manageRole: async (payload: RoleManagementPayload): Promise<void> => {
    await httpService.post('/User/RoleManagement', payload);
  },

  /**
   * Get all users who purchased a specific course
   * @param params - Query parameters (CourseId, PageIndex, PageSize)
   * @returns Promise with purchased courses response
   */
  getAllPurchasedCourses: async (params: PurchasedCoursesParams): Promise<PurchasedCoursesResponse> => {
    const response = await httpService.get<PurchasedCoursesResponse>(
      `/User/GetAllPurchasedCourses`,
      { params }
    );
    return response.data;
  },
};
