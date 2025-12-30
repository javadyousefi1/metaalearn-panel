import { useMutation } from '@tanstack/react-query';
import { httpService } from '@/services';
import { message } from 'antd';

interface ExchangeTokenResponse {
  token: string;
}

/**
 * useExchangeToken Hook - Exchange user token and copy to clipboard
 */
export const useExchangeToken = () => {
  const exchangeTokenMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await httpService.put<ExchangeTokenResponse>(
        `https://api.metaalearn.com/Management/ExchangeToken/${userId}`
      );
      return response.data;
    },
    onSuccess: async (data) => {
      try {
        // Copy token to clipboard
        await navigator.clipboard.writeText(data.token);
        message.success('توکن با موفقیت کپی شد');
      } catch (error) {
        message.error('خطا در کپی کردن توکن');
      }
    },
    onError: () => {
        message.error('خطا در دریافت توکن');
    },
  });

  return {
    exchangeToken: exchangeTokenMutation.mutateAsync,
    isExchanging: exchangeTokenMutation.isPending,
  };
};
