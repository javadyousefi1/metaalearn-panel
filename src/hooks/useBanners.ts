import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { bannerService } from '@/services';
import type { CreateBannerPayload, UpdateBannerPayload } from '@/types/banner.types';

const bannersQueryKey = QUERY_KEYS.BANNERS.ALL;

export const useBanners = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (payload: CreateBannerPayload) => bannerService.create(payload),
    onSuccess: () => {
      message.success('بنر با موفقیت ایجاد شد (پیش‌نویس)');
      queryClient.invalidateQueries({ queryKey: bannersQueryKey });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateBannerPayload) => bannerService.update(payload),
    onSuccess: () => {
      message.success('بنر با موفقیت به‌روزرسانی شد');
      queryClient.invalidateQueries({ queryKey: bannersQueryKey });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => bannerService.delete(id),
    onSuccess: () => {
      message.success('بنر حذف شد');
      queryClient.invalidateQueries({ queryKey: bannersQueryKey });
    },
  });

  return {
    createBanner: (payload: CreateBannerPayload) => createMutation.mutateAsync(payload),
    updateBanner: (payload: UpdateBannerPayload) => updateMutation.mutateAsync(payload),
    deleteBanner: (id: string) => deleteMutation.mutateAsync(id),
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
