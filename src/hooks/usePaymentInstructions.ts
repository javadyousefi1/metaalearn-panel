import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { paymentInstructionService } from '@/services/paymentInstruction.service';
import { queryKeys } from '@/config';
import type {
  CreatePaymentInstructionPayload,
  UpdatePaymentInstructionPayload,
  DeletePaymentInstructionParams,
} from '@/types/paymentInstruction.types';

/**
 * Custom hook for payment instruction mutations
 * Uses React Query for optimistic updates and cache management
 */
export const usePaymentInstructions = () => {
  const queryClient = useQueryClient();

  // Create payment instruction mutation
  const createMutation = useMutation({
    mutationFn: (payload: CreatePaymentInstructionPayload) =>
      paymentInstructionService.create(payload),
    onSuccess: () => {
      message.success('کارت با موفقیت ایجاد شد');
      queryClient.invalidateQueries({ queryKey: queryKeys.paymentInstructions.all });
    },
    onError: () => {
      message.error('خطا در ایجاد کارت');
    },
  });

  // Update payment instruction mutation
  const updateMutation = useMutation({
    mutationFn: (payload: UpdatePaymentInstructionPayload) =>
      paymentInstructionService.update(payload),
    onSuccess: () => {
      message.success('کارت با موفقیت به‌روزرسانی شد');
      queryClient.invalidateQueries({ queryKey: queryKeys.paymentInstructions.all });
    },
    onError: () => {
      message.error('خطا در به‌روزرسانی کارت');
    },
  });

  // Delete payment instruction mutation
  const deleteMutation = useMutation({
    mutationFn: (params: DeletePaymentInstructionParams) =>
      paymentInstructionService.delete(params),
    onSuccess: () => {
      message.success('کارت با موفقیت حذف شد');
      queryClient.invalidateQueries({ queryKey: queryKeys.paymentInstructions.all });
    },
    onError: () => {
      message.error('خطا در حذف کارت');
    },
  });

  return {
    // Mutation functions
    createPaymentInstruction: (payload: CreatePaymentInstructionPayload) =>
      createMutation.mutateAsync(payload),
    updatePaymentInstruction: (payload: UpdatePaymentInstructionPayload) =>
      updateMutation.mutateAsync(payload),
    deletePaymentInstruction: (params: DeletePaymentInstructionParams) =>
      deleteMutation.mutateAsync(params),

    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isProcessing: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  };
};
