import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { courseService } from '@/services';
import { queryKeys } from '@/config';
import { CreateCoursePayload, UpdateCoursePayload } from '@/types/course.types';

/**
 * Custom hook for course management with React Query
 */
export const useCourses = () => {
  const queryClient = useQueryClient();

  // Create course mutation
  const createMutation = useMutation({
    mutationFn: courseService.create,
    onSuccess: () => {
      message.success('دوره با موفقیت ایجاد شد');
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.all });
    },
    onError: () => {
      message.error('خطا در ایجاد دوره');
    },
  });

  // Update course mutation
  const updateMutation = useMutation({
    mutationFn: courseService.update,
    onSuccess: () => {
      message.success('دوره با موفقیت به‌روزرسانی شد');
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.all });
    },
    onError: () => {
      message.error('خطا در به‌روزرسانی دوره');
    },
  });

  return {
    // Mutations
    createCourse: (data: CreateCoursePayload) => createMutation.mutateAsync(data),
    updateCourse: (data: UpdateCoursePayload) => updateMutation.mutateAsync(data),

    // Loading
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
};
