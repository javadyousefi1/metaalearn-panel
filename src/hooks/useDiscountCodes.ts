import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { discountCodeService } from '@/services';
import type {
  CreateDiscountCodePayload,
  UpdateDiscountCodePayload,
} from '@/types/discountCode.types';

export const useDiscountCodes = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (payload: CreateDiscountCodePayload) => discountCodeService.create(payload),
    onSuccess: () => {
      message.success('کد تخفیف با موفقیت ایجاد شد');
      queryClient.invalidateQueries({ queryKey: ['discountCodes'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateDiscountCodePayload) => discountCodeService.update(payload),
    onSuccess: () => {
      message.success('کد تخفیف با موفقیت به‌روزرسانی شد');
      queryClient.invalidateQueries({ queryKey: ['discountCodes'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => discountCodeService.delete(id),
    onSuccess: () => {
      message.success('کد تخفیف با موفقیت حذف شد');
      queryClient.invalidateQueries({ queryKey: ['discountCodes'] });
    },
  });

  return {
    createDiscountCode: (payload: CreateDiscountCodePayload) =>
      createMutation.mutateAsync(payload),
    updateDiscountCode: (payload: UpdateDiscountCodePayload) =>
      updateMutation.mutateAsync(payload),
    deleteDiscountCode: (id: string) => deleteMutation.mutateAsync(id),
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
