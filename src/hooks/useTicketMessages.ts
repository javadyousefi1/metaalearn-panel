import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message as antdMessage } from 'antd';
import { ticketService } from '@/services';
import type { TicketMessage, CreateTicketMessagePayload } from '@/types/ticket.types';

interface UseTicketMessagesParams {
  ticketId: string | undefined;
  pageSize?: number;
}

interface UseTicketMessagesReturn {
  messages: TicketMessage[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  sendMessage: (payload: CreateTicketMessagePayload) => Promise<void>;
  isSending: boolean;
}

/**
 * Custom hook for fetching ticket messages
 * Uses React Query for caching and state management
 */
export const useTicketMessages = ({
  ticketId,
  pageSize = 1000,
}: UseTicketMessagesParams): UseTicketMessagesReturn => {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['ticket-messages', ticketId],
    queryFn: async () => {
      if (!ticketId) {
        throw new Error('Ticket ID is required');
      }
      const response = await ticketService.getAllMessages({
        TicketId: ticketId,
        PageIndex: 1,
        PageSize: pageSize,
      });
      return response;
    },
    enabled: !!ticketId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: ticketService.createMessage,
    onSuccess: () => {
      antdMessage.success('پیام با موفقیت ارسال شد');
      queryClient.invalidateQueries({ queryKey: ['ticket-messages', ticketId] });
    },
    onError: () => {
      antdMessage.error('خطا در ارسال پیام');
    },
  });

  return {
    messages: data?.items || [],
    isLoading,
    error: error as Error | null,
    refetch,
    sendMessage: (payload: CreateTicketMessagePayload) => sendMessageMutation.mutateAsync(payload),
    isSending: sendMessageMutation.isPending,
  };
};
