import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { categoryService } from '@/services';
import { queryKeys } from '@/config';
import { CreateCategoryPayload, UpdateCategoryPayload } from '@/types';

/**
 * Custom hook for category management with React Query
 */
export const useCategories = () => {
  const queryClient = useQueryClient();

  // Fetch all categories
  const {
    data: categories = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.categories.lists(),
    queryFn: categoryService.getAll,
  });

  // Create category mutation
  const createMutation = useMutation({
    mutationFn: categoryService.create,
    onSuccess: () => {
      message.success('دسته‌بندی با موفقیت ایجاد شد');
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
    onError: () => {
      message.error('خطا در ایجاد دسته‌بندی');
    },
  });

  // Update category mutation
  const updateMutation = useMutation({
    mutationFn: categoryService.update,
    onSuccess: () => {
      message.success('دسته‌بندی با موفقیت به‌روزرسانی شد');
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
    onError: () => {
      message.error('خطا در به‌روزرسانی دسته‌بندی');
    },
  });

  // Delete category mutation
  const deleteMutation = useMutation({
    mutationFn: categoryService.delete,
    onSuccess: () => {
      message.success('دسته‌بندی با موفقیت حذف شد');
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
    onError: () => {
      message.error('خطا در حذف دسته‌بندی');
    },
  });

  return {
    // Data
    categories,
    isLoading,
    error,
    refetch,

    // Mutations
    createCategory: (data: CreateCategoryPayload) => createMutation.mutateAsync(data),
    updateCategory: (data: UpdateCategoryPayload) => updateMutation.mutateAsync(data),
    deleteCategory: (id: string) => deleteMutation.mutateAsync(id),

    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

/**
 * Hook to fetch a single category by ID
 */
export const useCategory = (id: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.categories.detail(id || ''),
    queryFn: () => categoryService.getById(id!),
    enabled: !!id,
  });
};
