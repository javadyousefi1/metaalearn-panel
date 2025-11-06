import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services';
import { queryKeys } from '@/config';
import { UserListParams } from '@/types';

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
