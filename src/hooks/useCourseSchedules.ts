import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { courseScheduleService } from '@/services';
import { queryKeys } from '@/config';
import {
  CreateCourseSchedulePayload,
  UpdateCourseSchedulePayload,
  CourseScheduleListParams,
} from '@/types';

/**
 * Custom hook for course schedule management with React Query
 */
export const useCourseSchedules = () => {
  const queryClient = useQueryClient();

  // Create course schedule mutation
  const createMutation = useMutation({
    mutationFn: courseScheduleService.create,
    onSuccess: () => {
      message.success('گروه‌بندی با موفقیت ایجاد شد');
      queryClient.invalidateQueries({ queryKey: queryKeys.schedules.all });
    },
    onError: () => {
      message.error('خطا در ایجاد گروه‌بندی');
    },
  });

  // Update course schedule mutation
  const updateMutation = useMutation({
    mutationFn: courseScheduleService.update,
    onSuccess: () => {
      message.success('گروه‌بندی با موفقیت به‌روزرسانی شد');
      queryClient.invalidateQueries({ queryKey: queryKeys.schedules.all });
    },
    onError: () => {
      message.error('خطا در به‌روزرسانی گروه‌بندی');
    },
  });

  // Delete course schedule mutation
  const deleteMutation = useMutation({
    mutationFn: courseScheduleService.delete,
    onSuccess: () => {
      message.success('گروه‌بندی با موفقیت حذف شد');
      queryClient.invalidateQueries({ queryKey: queryKeys.schedules.all });
    },
    onError: () => {
      message.error('خطا در حذف گروه‌بندی');
    },
  });

  return {
    // Mutations
    createSchedule: (data: CreateCourseSchedulePayload) => createMutation.mutateAsync(data),
    updateSchedule: (data: UpdateCourseSchedulePayload) => updateMutation.mutateAsync(data),
    deleteSchedule: (id: string) => deleteMutation.mutateAsync(id),

    // Loading states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

/**
 * Custom hook for getting all course schedules with optional filters
 * @param params - Query parameters (CourseId, PageIndex, PageSize)
 * @param enabled - Whether the query should run (optional, defaults to true)
 */
export const useGetAllSchedules = (params?: CourseScheduleListParams, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.schedules.list(params as unknown as Record<string, unknown>),
    queryFn: () => courseScheduleService.getAll(params),
    enabled,
    select: (data) => data?.items
  });
};

/**
 * Custom hook for getting a course schedule by ID
 * @param id - Course Schedule ID
 * @param enabled - Whether the query should run (optional, defaults to true when id is provided)
 */
export const useGetScheduleById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.schedules.detail(id),
    queryFn: () => courseScheduleService.getById(id),
    enabled: !!id && enabled,
  });
};
