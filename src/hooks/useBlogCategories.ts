import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { blogCategoryService } from '@/services';
import { queryKeys } from '@/config';
import { CreateBlogCategoryPayload, UpdateBlogCategoryPayload } from '@/types/blogCategory.types';

/**
 * Custom hook for blog category management with React Query
 */
export const useBlogCategories = () => {
  const queryClient = useQueryClient();

  // Create blog category mutation
  const createMutation = useMutation({
    mutationFn: blogCategoryService.create,
    onSuccess: () => {
      message.success('دسته‌بندی با موفقیت ایجاد شد');
      queryClient.invalidateQueries({ queryKey: queryKeys.blogCategories.all });
    },
    onError: () => {
      message.error('خطا در ایجاد دسته‌بندی');
    },
  });

  // Update blog category mutation
  const updateMutation = useMutation({
    mutationFn: blogCategoryService.update,
    onSuccess: () => {
      message.success('دسته‌بندی با موفقیت به‌روزرسانی شد');
      queryClient.invalidateQueries({ queryKey: queryKeys.blogCategories.all });
    },
    onError: () => {
      message.error('خطا در به‌روزرسانی دسته‌بندی');
    },
  });

  // Delete blog category mutation
  const deleteMutation = useMutation({
    mutationFn: blogCategoryService.delete,
    onSuccess: () => {
      message.success('دسته‌بندی با موفقیت حذف شد');
      queryClient.invalidateQueries({ queryKey: queryKeys.blogCategories.all });
    },
    onError: () => {
      message.error('خطا در حذف دسته‌بندی');
    },
  });

  return {
    // Mutations
    createBlogCategory: (data: CreateBlogCategoryPayload) => createMutation.mutateAsync(data),
    updateBlogCategory: (data: UpdateBlogCategoryPayload) => updateMutation.mutateAsync(data),
    deleteBlogCategory: (id: string) => deleteMutation.mutateAsync(id),

    // Loading states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

/**
 * Custom hook for getting all blog categories
 * @param enabled - Whether the query should run (optional, defaults to true)
 */
export const useGetAllBlogCategories = (enabled = true) => {
  return useQuery({
    queryKey: queryKeys.blogCategories.all,
    queryFn: () => blogCategoryService.getAll(),
    enabled,
  });
};
