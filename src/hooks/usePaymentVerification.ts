import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { paymentService } from '@/services';
import { VerifyPaymentPayload } from '@/types/payment.types';

/**
 * Custom hook for verifying payments
 */
export const usePaymentVerification = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: paymentService.verify,
    onSuccess: () => {
      message.success('پرداخت با موفقیت تایید شد');
      // Invalidate payments queries to refresh the table
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
    onError: () => {
      message.error('خطا در تایید پرداخت');
    },
  });

  return {
    verifyPayment: (data: VerifyPaymentPayload) => mutation.mutateAsync(data),
    isVerifying: mutation.isPending,
  };
};
