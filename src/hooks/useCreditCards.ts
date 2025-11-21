import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { creditCardService } from '@/services';
import { queryKeys } from '@/config';
import { UpdateCreditCardIdentityPayload } from '@/types/user.types';

/**
 * Custom hook for updating credit card identity status
 */
export const useUpdateCreditCardIdentity = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: creditCardService.updateIdentity,
    onSuccess: () => {
      message.success('وضعیت کارت بانکی با موفقیت به‌روزرسانی شد');
      // Invalidate both users and credit-cards queries to refresh the table
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: ['credit-cards'] });
    },
  });

  return {
    updateCreditCardIdentity: (data: UpdateCreditCardIdentityPayload) => mutation.mutateAsync(data),
    isUpdating: mutation.isPending,
  };
};
