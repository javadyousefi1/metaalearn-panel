import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { paymentService } from '@/services';
import { VerifyPaymentPayload, RejectPaymentPayload } from '@/types/payment.types';

/**
 * Custom hook for verifying payments
 */
export const usePaymentVerification = () => {
  const queryClient = useQueryClient();

  const verifyMutation = useMutation({
    mutationFn: paymentService.verify,
    onSuccess: () => {
      message.success('پرداخت با موفقیت تایید شد');
      // Invalidate payments queries to refresh the table
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: paymentService.reject,
    onSuccess: () => {
      message.success('پرداخت با موفقیت رد شد');
      // Invalidate payments queries to refresh the table
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });

  return {
    verifyPayment: (data: VerifyPaymentPayload) => verifyMutation.mutateAsync(data),
    rejectPayment: (data: RejectPaymentPayload) => rejectMutation.mutateAsync(data),
    isVerifying: verifyMutation.isPending,
    isRejecting: rejectMutation.isPending,
    isProcessing: verifyMutation.isPending || rejectMutation.isPending,
  };
};
