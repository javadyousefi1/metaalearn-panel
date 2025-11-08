import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { courseGalleryService } from '@/services';
import { queryKeys } from '@/config';
import {
  UploadCourseGalleryPayload,
  CourseGalleryListParams,
} from '@/types';

/**
 * Custom hook for course gallery management with React Query
 */
export const useCourseGallery = (courseId?: string) => {
  const queryClient = useQueryClient();

  // Upload (create or update) gallery item mutation
  const uploadMutation = useMutation({
    mutationFn: courseGalleryService.upload,
    onSuccess: () => {
      message.success('فایل با موفقیت آپلود شد');
      if (courseId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.gallery.byCourse(courseId) });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.gallery.all });
    },
    onError: () => {
      message.error('خطا در آپلود فایل');
    },
  });

  // Delete gallery item mutation
  const deleteMutation = useMutation({
    mutationFn: courseGalleryService.delete,
    onSuccess: () => {
      message.success('فایل با موفقیت حذف شد');
      if (courseId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.gallery.byCourse(courseId) });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.gallery.all });
    },
    onError: () => {
      message.error('خطا در حذف فایل');
    },
  });

  return {
    // Mutations
    uploadGallery: (data: UploadCourseGalleryPayload) => uploadMutation.mutateAsync(data),
    deleteGallery: (id: string) => deleteMutation.mutateAsync(id),

    // Loading states
    isUploading: uploadMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

/**
 * Custom hook for getting all gallery items for a course
 * @param params - Query parameters (CourseId, PageIndex, PageSize)
 * @param enabled - Whether the query should run (optional, defaults to true)
 */
export const useGetCourseGallery = (params: CourseGalleryListParams, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.gallery.byCourse(params.CourseId),
    queryFn: () => courseGalleryService.getAll(params),
    enabled: !!params.CourseId && enabled,
    select: (data) => data?.items || []
  });
};
