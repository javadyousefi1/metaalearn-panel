import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { blogService } from '@/services';
import { queryKeys } from '@/config';
import { CreateBlogPayload, UpdateBlogPayload, BlogListParams } from '@/types/blog.types';

/**
 * Custom hook for blog management with React Query
 */
export const useBlogs = () => {
  const queryClient = useQueryClient();

  // Create blog mutation
  const createMutation = useMutation({
    mutationFn: blogService.create,
    onSuccess: () => {
      message.success('مقاله با موفقیت ایجاد شد');
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.all });
    },
    onError: () => {
      message.error('خطا در ایجاد مقاله');
    },
  });

  // Update blog mutation
  const updateMutation = useMutation({
    mutationFn: blogService.update,
    onSuccess: () => {
      message.success('مقاله با موفقیت به‌روزرسانی شد');
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.all });
    },
    onError: () => {
      message.error('خطا در به‌روزرسانی مقاله');
    },
  });

  // Delete blog mutation
  const deleteMutation = useMutation({
    mutationFn: blogService.delete,
    onSuccess: () => {
      message.success('مقاله با موفقیت حذف شد');
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.all });
    },
    onError: () => {
      message.error('خطا در حذف مقاله');
    },
  });

  return {
    // Mutations
    createBlog: (data: CreateBlogPayload) => createMutation.mutateAsync(data),
    updateBlog: (data: UpdateBlogPayload) => updateMutation.mutateAsync(data),
    deleteBlog: (id: string) => deleteMutation.mutateAsync(id),

    // Loading states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

/**
 * Custom hook for getting all blogs
 * @param params - Query parameters (PageIndex, PageSize)
 * @param enabled - Whether the query should run (optional, defaults to true)
 */
export const useGetAllBlogs = (params: BlogListParams, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.blogs.list(params),
    queryFn: () => blogService.getAll(params),
    enabled,
  });
};

/**
 * Custom hook for getting a blog by ID
 * @param id - Blog ID
 * @param enabled - Whether the query should run (optional, defaults to true when id is provided)
 */
export const useGetBlogById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.blogs.detail(id),
    queryFn: () => blogService.getById(id),
    enabled: !!id && enabled,
  });
};
