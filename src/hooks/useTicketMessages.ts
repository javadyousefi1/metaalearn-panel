import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message as antdMessage } from 'antd';
import { ticketService } from '@/services';
import type {
  TicketMessage,
  CreateTicketMessagePayload,
  UpdateTicketMessagePayload,
} from '@/types/ticket.types';

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
  updateMessage: (payload: UpdateTicketMessagePayload) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  isSending: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
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

  // Update message mutation
  const updateMessageMutation = useMutation({
    mutationFn: ticketService.updateMessage,
    onSuccess: () => {
      antdMessage.success('پیام با موفقیت ویرایش شد');
      queryClient.invalidateQueries({ queryKey: ['ticket-messages', ticketId] });
    },
    onError: () => {
      antdMessage.error('خطا در ویرایش پیام');
    },
  });

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: ticketService.deleteMessage,
    onSuccess: () => {
      antdMessage.success('پیام با موفقیت حذف شد');
      queryClient.invalidateQueries({ queryKey: ['ticket-messages', ticketId] });
    },
    onError: () => {
      antdMessage.error('خطا در حذف پیام');
    },
  });

  return {
    messages: data?.items || [],
    isLoading,
    error: error as Error | null,
    refetch,
    sendMessage: (payload: CreateTicketMessagePayload) => sendMessageMutation.mutateAsync(payload),
    updateMessage: (payload: UpdateTicketMessagePayload) => updateMessageMutation.mutateAsync(payload),
    deleteMessage: (id: string) => deleteMessageMutation.mutateAsync(id),
    isSending: sendMessageMutation.isPending,
    isUpdating: updateMessageMutation.isPending,
    isDeleting: deleteMessageMutation.isPending,
  };
};
