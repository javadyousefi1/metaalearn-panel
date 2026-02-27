import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { paymentService } from '@/services';
import { RefundPaymentPayload } from '@/types/payment.types';

export const usePaymentRefund = () => {
  const queryClient = useQueryClient();

  const refundMutation = useMutation({
    mutationFn: (payload: RefundPaymentPayload) => paymentService.refund(payload),
    onSuccess: () => {
      message.success('استرداد وجه با موفقیت انجام شد');
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
    onError: () => {
      message.error('خطا در انجام استرداد وجه');
    },
  });

  return {
    refundPayment: (data: RefundPaymentPayload) => refundMutation.mutateAsync(data),
    isRefunding: refundMutation.isPending,
  };
};
