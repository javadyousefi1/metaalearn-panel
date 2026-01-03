import { useQuery } from '@tanstack/react-query';
import { courseTicketService } from '@/services';
import type { CourseTicketDetail } from '@/types/courseTicket.types';

interface UseCourseTicketDetailParams {
  courseTicketId: string | undefined;
}

interface UseCourseTicketDetailReturn {
  ticketDetail: CourseTicketDetail | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Custom hook for fetching course ticket detail
 * Uses React Query for caching and state management
 */
export const useCourseTicketDetail = ({
  courseTicketId,
}: UseCourseTicketDetailParams): UseCourseTicketDetailReturn => {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['course-ticket-detail', courseTicketId],
    queryFn: async () => {
      if (!courseTicketId) {
        throw new Error('Course Ticket ID is required');
      }
      const response = await courseTicketService.get(courseTicketId);
      return response;
    },
    enabled: !!courseTicketId,
  });

  return {
    ticketDetail: data,
    isLoading,
    error: error as Error | null,
    refetch,
  };
};
