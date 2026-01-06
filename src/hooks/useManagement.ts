import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { managementService } from '@/services';
import { queryKeys } from '@/config';
import { RegisterUsersToCourseRqDto } from '@/types/management.types';

/**
 * Custom hook for management operations with React Query
 */
export const useManagement = () => {
  const queryClient = useQueryClient();
  const registerUsersMutation = useMutation({
    mutationFn: (data: RegisterUsersToCourseRqDto) =>
      managementService.registerUsersToCourse(data),
    onSuccess: () => {
      message.success('ثبت‌نام با موفقیت انجام شد');
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.all });
    },
    onError: (error: unknown) => {
      console.error('Error registering users:', error);
      message.error('خطا در ثبت‌نام کاربران');
    },
  });

  return {
    registerUsersToCourse: (data: RegisterUsersToCourseRqDto) =>
      registerUsersMutation.mutateAsync(data),
    isRegistering: registerUsersMutation.isPending,
  };
};
