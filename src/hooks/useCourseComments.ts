import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { courseCommentService } from '@/services/courseComment.service';
import { queryKeys } from '@/config';
import {
  GetCourseCommentsParams,
  UpdateCommentApprovalParams,
} from '@/types/courseComment.types';

/**
 * Custom hook for course comment management with React Query
 */
export const useCourseComments = () => {
  const queryClient = useQueryClient();

  // Update comment approval mutation
  const updateApprovalMutation = useMutation({
    mutationFn: courseCommentService.updateApproval,
    onSuccess: () => {
      message.success('وضعیت تایید نظر با موفقیت به‌روزرسانی شد');
      queryClient.invalidateQueries({ queryKey: queryKeys.courseComments.all });
    },
    onError: () => {
      message.error('خطا در به‌روزرسانی وضعیت تایید نظر');
    },
  });

  return {
    // Mutations
    updateApproval: (params: UpdateCommentApprovalParams) => updateApprovalMutation.mutateAsync(params),

    // Loading states
    isUpdating: updateApprovalMutation.isPending,
  };
};

/**
 * Custom hook for getting course comments with pagination
 * @param params - Course ID and pagination parameters
 * @param enabled - Whether the query should run (optional, defaults to true when courseId is provided)
 */
export const useGetCourseComments = (params: GetCourseCommentsParams, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.courseComments.list(params.courseId, {
      pageIndex: params.pageIndex,
      pageSize: params.pageSize,
      isApproved: params.isApproved,
    }),
    queryFn: () => courseCommentService.getAll(params),
    enabled: !!params.courseId && enabled,
  });
};
