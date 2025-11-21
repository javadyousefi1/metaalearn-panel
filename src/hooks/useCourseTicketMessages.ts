import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message as antdMessage } from 'antd';
import { courseTicketService } from '@/services';
import type {
  CourseTicketMessage,
  CreateCourseTicketMessagePayload,
  UpdateCourseTicketMessagePayload,
} from '@/types/courseTicket.types';

interface UseCourseTicketMessagesParams {
  courseTicketId: string | undefined;
  pageSize?: number;
}

interface UseCourseTicketMessagesReturn {
  messages: CourseTicketMessage[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  sendMessage: (payload: CreateCourseTicketMessagePayload) => Promise<void>;
  updateMessage: (payload: UpdateCourseTicketMessagePayload) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  isSending: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

/**
 * Custom hook for fetching course ticket messages
 * Uses React Query for caching and state management
 */
export const useCourseTicketMessages = ({
  courseTicketId,
  pageSize = 1000,
}: UseCourseTicketMessagesParams): UseCourseTicketMessagesReturn => {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['course-ticket-messages', courseTicketId],
    queryFn: async () => {
      if (!courseTicketId) {
        throw new Error('Course Ticket ID is required');
      }
      const response = await courseTicketService.getAllMessages({
        CourseTicketId: courseTicketId,
        PageIndex: 1,
        PageSize: pageSize,
      });
      return response;
    },
    enabled: !!courseTicketId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: courseTicketService.createMessage,
    onSuccess: () => {
      antdMessage.success('پیام با موفقیت ارسال شد');
      queryClient.invalidateQueries({ queryKey: ['course-ticket-messages', courseTicketId] });
    },
    onError: () => {
      antdMessage.error('خطا در ارسال پیام');
    },
  });

  // Update message mutation
  const updateMessageMutation = useMutation({
    mutationFn: courseTicketService.updateMessage,
    onSuccess: () => {
      antdMessage.success('پیام با موفقیت ویرایش شد');
      queryClient.invalidateQueries({ queryKey: ['course-ticket-messages', courseTicketId] });
    },
    onError: () => {
      antdMessage.error('خطا در ویرایش پیام');
    },
  });

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: courseTicketService.deleteMessage,
    onSuccess: () => {
      antdMessage.success('پیام با موفقیت حذف شد');
      queryClient.invalidateQueries({ queryKey: ['course-ticket-messages', courseTicketId] });
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
    sendMessage: (payload: CreateCourseTicketMessagePayload) => sendMessageMutation.mutateAsync(payload),
    updateMessage: (payload: UpdateCourseTicketMessagePayload) => updateMessageMutation.mutateAsync(payload),
    deleteMessage: (id: string) => deleteMessageMutation.mutateAsync(id),
    isSending: sendMessageMutation.isPending,
    isUpdating: updateMessageMutation.isPending,
    isDeleting: deleteMessageMutation.isPending,
  };
};
