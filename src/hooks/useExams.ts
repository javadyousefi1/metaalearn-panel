import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { examService } from '@/services';
import { queryKeys } from '@/config';
import {
  CredentialExamListParams,
  CreateCredentialExamPayload,
  UpdateCredentialExamPayload,
} from '@/types/exam.types';

export const useExams = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: examService.create,
    onSuccess: () => {
      message.success('آزمون با موفقیت ایجاد شد');
      queryClient.invalidateQueries({ queryKey: queryKeys.exams.all });
    },
    onError: () => {
      message.error('خطا در ایجاد آزمون');
    },
  });

  const updateMutation = useMutation({
    mutationFn: examService.update,
    onSuccess: () => {
      message.success('آزمون با موفقیت به‌روزرسانی شد');
      queryClient.invalidateQueries({ queryKey: queryKeys.exams.all });
    },
    onError: () => {
      message.error('خطا در به‌روزرسانی آزمون');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: examService.delete,
    onSuccess: () => {
      message.success('آزمون با موفقیت حذف شد');
      queryClient.invalidateQueries({ queryKey: queryKeys.exams.all });
    },
    onError: () => {
      message.error('خطا در حذف آزمون');
    },
  });

  return {
    createExam: (data: CreateCredentialExamPayload) => createMutation.mutateAsync(data),
    updateExam: (data: UpdateCredentialExamPayload) => updateMutation.mutateAsync(data),
    deleteExam: (id: string) => deleteMutation.mutateAsync(id),
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export const useGetAllExams = (params: CredentialExamListParams, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.exams.list(params.CourseId),
    queryFn: () => examService.getAll(params),
    enabled: !!params.CourseId && enabled,
    select: (data) => data?.items,
  });
};
