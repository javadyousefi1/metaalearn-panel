import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { useState, useCallback } from 'react';
import { courseSessionService } from '@/services';
import { queryKeys } from '@/config';
import { CreateSessionPayload, UpdateSessionPayload } from '@/types/session.types';

/**
 * Custom hook for course session management with React Query
 */
export const useCourseSessions = () => {
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState<number>(0);

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
    mutationFn: ({ file, courseSessionId, uploadType, onProgress }: {
      file: File;
      courseSessionId: string;
      uploadType: number;
      onProgress?: (progress: number) => void;
    }) => {
      setUploadProgress(0);
      return courseSessionService.upload(file, courseSessionId, uploadType, (progress) => {
        setUploadProgress(progress);
        if (onProgress) {
          onProgress(progress);
        }
      });
    },
    onSuccess: () => {
      message.success('فایل با موفقیت آپلود شد');
      setUploadProgress(0);
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
    },
    onError: () => {
      message.error('خطا در آپلود فایل');
      setUploadProgress(0);
    },
  });

  const uploadFile = useCallback(
    (file: File, courseSessionId: string, uploadType: number, onProgress?: (progress: number) => void) => {
      return uploadMutation.mutateAsync({ file, courseSessionId, uploadType, onProgress });
    },
    [uploadMutation]
  );

  return {
    // Mutations
    createSession: (data: CreateSessionPayload) => createMutation.mutateAsync(data),
    updateSession: (data: UpdateSessionPayload) => updateMutation.mutateAsync(data),
    deleteSession: (id: string) => deleteMutation.mutateAsync(id),
    uploadFile,

    // Loading states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isUploading: uploadMutation.isPending,
    uploadProgress,
  };
};

/**
 * Custom hook for getting all course sessions
 * @param enabled - Whether the query should run (optional, defaults to true)
 */
export const useGetAllSessions = (enabled = true, params: {courseId:string,isPracticeAvailable:boolean}) => {
  return useQuery({
    queryKey: queryKeys.sessions.detail(params.courseId),
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
