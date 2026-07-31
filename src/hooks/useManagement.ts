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

  const renewCourseVideosMutation = useMutation({
    mutationFn: (courseId: string) => managementService.renewCourseVideos(courseId),
    onSuccess: () => {
      message.success('بازسازی ویدیوهای دوره در صف پردازش قرار گرفت');
    },
    onError: (error: unknown) => {
      console.error('Error renewing course videos:', error);
      message.error('خطا در ثبت درخواست بازسازی ویدیوهای دوره');
    },
  });

  const renewSessionVideoMutation = useMutation({
    mutationFn: (courseSessionId: string) => managementService.renewSessionVideo(courseSessionId),
    onSuccess: () => {
      message.success('بازسازی ویدیوی جلسه در صف پردازش قرار گرفت');
    },
    onError: (error: unknown) => {
      console.error('Error renewing session video:', error);
      message.error('خطا در ثبت درخواست بازسازی ویدیوی جلسه');
    },
  });

  const checkSessionVideoIntegrityMutation = useMutation({
    mutationFn: (courseSessionId: string) =>
      managementService.checkSessionVideoIntegrity(courseSessionId),
    onError: (error: unknown) => {
      console.error('Error checking session video integrity:', error);
      message.error('خطا در بررسی سلامت ویدیوی جلسه');
    },
  });

  return {
    registerUsersToCourse: (data: RegisterUsersToCourseRqDto) =>
      registerUsersMutation.mutateAsync(data),
    isRegistering: registerUsersMutation.isPending,

    renewCourseVideos: (courseId: string) => renewCourseVideosMutation.mutateAsync(courseId),
    isRenewingCourseVideos: renewCourseVideosMutation.isPending,

    renewSessionVideo: (courseSessionId: string) =>
      renewSessionVideoMutation.mutateAsync(courseSessionId),
    isRenewingSessionVideo: renewSessionVideoMutation.isPending,

    checkSessionVideoIntegrity: (courseSessionId: string) =>
      checkSessionVideoIntegrityMutation.mutateAsync(courseSessionId),
    isCheckingSessionVideoIntegrity: checkSessionVideoIntegrityMutation.isPending,
  };
};
