import { useQuery } from '@tanstack/react-query';
import { ticketService } from '@/services';
import type { TicketDetail } from '@/types/ticket.types';

interface UseTicketDetailParams {
  ticketId: string | undefined;
}

interface UseTicketDetailReturn {
  ticketDetail: TicketDetail | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Custom hook for fetching ticket detail
 * Uses React Query for caching and state management
 */
export const useTicketDetail = ({
  ticketId,
}: UseTicketDetailParams): UseTicketDetailReturn => {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['ticket-detail', ticketId],
    queryFn: async () => {
      if (!ticketId) {
        throw new Error('Ticket ID is required');
      }
      const response = await ticketService.get(ticketId);
      return response;
    },
    enabled: !!ticketId,
  });

  return {
    ticketDetail: data,
    isLoading,
    error: error as Error | null,
    refetch,
  };
};
