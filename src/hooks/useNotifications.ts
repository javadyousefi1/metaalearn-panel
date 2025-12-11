import { useMutation } from '@tanstack/react-query';
import { message } from 'antd';
import { notificationService } from '@/services';
import { CreateNotificationPayload } from '@/types/notification.types';

/**
 * Custom hook for notification management with React Query
 */
export const useNotifications = () => {
  // Create notification mutation
  const createMutation = useMutation({
    mutationFn: notificationService.create,
    onSuccess: () => {
      message.success('اعلان با موفقیت ارسال شد');
    },
    onError: () => {
      message.error('خطا در ارسال اعلان');
    },
  });

  return {
    // Mutations
    createNotification: (data: CreateNotificationPayload) => createMutation.mutateAsync(data),

    // Loading states
    isCreating: createMutation.isPending,
  };
};
