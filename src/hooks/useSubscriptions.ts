import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { subscriptionService } from '@/services';
import type {
  CreateSubscriptionPayload,
  UpdateSubscriptionPayload,
} from '@/types/subscription.types';

export const useSubscriptions = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (payload: CreateSubscriptionPayload) => subscriptionService.create(payload),
    onSuccess: () => {
      message.success('اشتراک با موفقیت ایجاد شد');
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
    onError: () => {
      message.error('خطا در ایجاد اشتراک');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateSubscriptionPayload) => subscriptionService.update(payload),
    onSuccess: () => {
      message.success('اشتراک با موفقیت به‌روزرسانی شد');
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
    onError: () => {
      message.error('خطا در به‌روزرسانی اشتراک');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => subscriptionService.delete(id),
    onSuccess: () => {
      message.success('اشتراک با موفقیت حذف شد');
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
    onError: () => {
      message.error('خطا در حذف اشتراک');
    },
  });

  return {
    createSubscription: (payload: CreateSubscriptionPayload) => createMutation.mutateAsync(payload),
    updateSubscription: (payload: UpdateSubscriptionPayload) => updateMutation.mutateAsync(payload),
    deleteSubscription: (id: string) => deleteMutation.mutateAsync(id),
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
