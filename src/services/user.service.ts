import { httpService } from './http.service';
import { UserListResponse, UserListParams } from '@/types/courseSchedule.types';
import { GetAllUsersParams, AllUsersResponse, UpdateUserIdentityPayload, RoleManagementPayload, PurchasedCoursesParams, PurchasedCoursesResponse, UpdateUserInvoicePayload } from '@/types/user.types';
import { User } from '@/types/auth.types';

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

  /**
   * Get current user profile
   * @returns Promise with user profile data
   */
  getUserProfile: async (): Promise<User> => {
    const response = await httpService.get<User>(
        `/User/Get`,
        { params: { includeProfile: true } }
    );

    console.log(response , "javad user response");
    return response.data;
  },

  /**
   * Update user invoice (activate/deactivate access)
   * @param payload - Invoice update data (actionType, valueId, isRejectedByAdmin, rejectedByAdminMessage)
   */
  updateUserInvoice: async (payload: UpdateUserInvoicePayload): Promise<void> => {
    await httpService.put('/UserInvoice/Update', payload);
  },

  /**
   * Get user by ID with invoices
   * @param userId - The user ID
   * @returns Promise with user data including invoices
   */
  getUserWithInvoices: async (userId: string): Promise<any> => {
    const response = await httpService.get<any>(
        `/User/Get`,
        { params: { userId, includeInvoices: true } }
    );
    return response.data;
  },
};
