import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { courseSessionService } from '@/services';
import { queryKeys } from '@/config';
import { CreateSessionPayload, UpdateSessionPayload } from '@/types/session.types';

/**
 * Custom hook for course session management with React Query
 */
export const useCourseSessions = () => {
  const queryClient = useQueryClient();

  // Create course session mutation
  const createMutation = useMutation({
    mutationFn: courseSessionService.create,
    onSuccess: () => {
      message.success('جلسه با موفقیت ایجاد شد');
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
    },
  });

  // Update course session mutation
  const updateMutation = useMutation({
    mutationFn: courseSessionService.update,
    onSuccess: () => {
      message.success('جلسه با موفقیت به‌روزرسانی شد');
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
    },
    onError: () => {
      message.error('خطا در به‌روزرسانی جلسه');
    },
  });

  // Delete course session mutation
  const deleteMutation = useMutation({
    mutationFn: courseSessionService.delete,
    onSuccess: () => {
      message.success('جلسه با موفقیت حذف شد');
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
    },
    onError: () => {
      message.error('خطا در حذف جلسه');
    },
  });

  // Upload file mutation
  const uploadMutation = useMutation({
    mutationFn: ({ file, courseSessionId, uploadType }: { file: File; courseSessionId: string; uploadType: number }) =>
      courseSessionService.upload(file, courseSessionId, uploadType),
    onSuccess: () => {
      message.success('فایل با موفقیت آپلود شد');
    },
    onError: () => {
      message.error('خطا در آپلود فایل');
    },
  });

  return {
    // Mutations
    createSession: (data: CreateSessionPayload) => createMutation.mutateAsync(data),
    updateSession: (data: UpdateSessionPayload) => updateMutation.mutateAsync(data),
    deleteSession: (id: string) => deleteMutation.mutateAsync(id),
    uploadFile: (file: File, courseSessionId: string, uploadType: number) =>
      uploadMutation.mutateAsync({ file, courseSessionId, uploadType }),

    // Loading states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isUploading: uploadMutation.isPending,
  };
};

/**
 * Custom hook for getting all course sessions
 * @param enabled - Whether the query should run (optional, defaults to true)
 */
export const useGetAllSessions = (enabled = true, params: {courseId:string,isPracticeAvailable:boolean}) => {
  return useQuery({
    queryKey: queryKeys.sessions.all,
    queryFn: () => courseSessionService.getAll(params),
    enabled,
      select :(data) => data?.items
  });
};

/**
 * Custom hook for getting a course session by ID
 * @param id - Course Session ID
 * @param enabled - Whether the query should run (optional, defaults to true when id is provided)
 */
export const useGetSessionById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.sessions.detail(id),
    queryFn: () => courseSessionService.getById(id),
    enabled: !!id && enabled,
  });
};
