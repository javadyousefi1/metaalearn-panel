import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { userService } from '@/services';
import { queryKeys } from '@/config';
import { UserListParams, UpdateUserIdentityPayload, PurchasedCoursesParams } from '@/types';

/**
 * Custom hook for getting users by role
 * @param params - Query parameters (role, PageIndex, PageSize)
 * @param enabled - Whether the query should run (optional, defaults to true)
 */
export const useGetUsersByRole = (params: UserListParams, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.users.byRole(params.role),
    queryFn: () => userService.getAllByRole(params),
    enabled,
    select: (data) => data?.items || []
  });
};

/**
 * Custom hook for getting all users without role filter
 * @param params - Query parameters (PageIndex, PageSize, IncludeProfile, IncludeIdentity)
 * @param enabled - Whether the query should run (optional, defaults to true)
 */
export const useGetAllUsers = (
  params: { PageIndex: number; PageSize: number; IncludeProfile?: boolean; IncludeIdentity?: boolean },
  enabled = true
) => {
  return useQuery({
    queryKey: queryKeys.users.list(params as unknown as Record<string, unknown>),
    queryFn: () => userService.getAll(params),
    enabled,
  });
};

/**
 * Custom hook for updating user identity status
 */
export const useUpdateUserIdentity = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: userService.updateIdentity,
    onSuccess: () => {
      message.success('وضعیت هویت کاربر با موفقیت به‌روزرسانی شد');
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });

  return {
    updateUserIdentity: (data: UpdateUserIdentityPayload) => mutation.mutateAsync(data),
    isUpdating: mutation.isPending,
  };
};

/**
 * Custom hook for getting users who purchased a specific course
 * @param params - Query parameters (CourseId, PageIndex, PageSize)
 * @param enabled - Whether the query should run (optional, defaults to true)
 */
export const useGetPurchasedCourseUsers = (params: PurchasedCoursesParams, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.users.purchasedCourses(params.CourseId),
    queryFn: () => userService.getAllPurchasedCourses(params),
    enabled: !!params.CourseId && enabled,
    select: (data) => data?.courses?.items?.map(item => item.userInfo) || []
  });
};

/**
 * Custom hook for getting courses purchased by a specific user
 * @param params - Query parameters (UserId, PageIndex, PageSize)
 * @param enabled - Whether the query should run (optional, defaults to true)
 */
export const useGetUserPurchasedCourses = (params: PurchasedCoursesParams, enabled = true) => {
  return useQuery({
    queryKey: ['user-purchased-courses', params.UserId],
    queryFn: () => userService.getAllPurchasedCourses(params),
    enabled: !!params.UserId && enabled,
    select: (data) => data?.courses?.items || []
  });
};
