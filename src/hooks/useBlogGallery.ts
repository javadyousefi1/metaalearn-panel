import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { message } from 'antd';
import { blogGalleryService } from '@/services';
import { queryKeys } from '@/config';
import { BlogGalleryListParams, UploadBlogGalleryPayload } from '@/types/blogGallery.types';

/**
 * Custom hook for blog gallery management with React Query
 */
export const useBlogGallery = () => {
  const queryClient = useQueryClient();

  // Upload blog gallery mutation
  const uploadMutation = useMutation({
    mutationFn: blogGalleryService.upload,
    onSuccess: () => {
      message.success('فایل با موفقیت آپلود شد');
      queryClient.invalidateQueries({ queryKey: queryKeys.blogGallery.all });
    },
    onError: () => {
      message.error('خطا در آپلود فایل');
    },
  });

  // Delete blog gallery mutation
  const deleteMutation = useMutation({
    mutationFn: blogGalleryService.delete,
    onSuccess: () => {
      message.success('فایل با موفقیت حذف شد');
      queryClient.invalidateQueries({ queryKey: queryKeys.blogGallery.all });
    },
    onError: () => {
      message.error('خطا در حذف فایل');
    },
  });

  return {
    // Mutations
    uploadGallery: (data: UploadBlogGalleryPayload) => uploadMutation.mutateAsync(data),
    deleteGallery: (id: string) => deleteMutation.mutateAsync(id),

    // Loading states
    isUploading: uploadMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

/**
 * Custom hook for getting all blog gallery items
 * @param params - Query parameters (BlogId, PageIndex, PageSize)
 * @param enabled - Whether the query should run (optional, defaults to true)
 */
export const useGetBlogGallery = (params: BlogGalleryListParams, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.blogGallery.byBlog(params.BlogId),
    queryFn: () => blogGalleryService.getAll(params),
    enabled: !!params.BlogId && enabled,
  });
};
