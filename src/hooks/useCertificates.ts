import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { certificateService } from '@/services';
import type { UpdateCertificatePayload } from '@/types/certificate.types';

export const useCertificates = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateCertificatePayload) => certificateService.update(payload),
    onSuccess: () => {
      message.success('وضعیت مدرک با موفقیت به‌روزرسانی شد');
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
    },
  });

  return {
    updateCertificate: (payload: UpdateCertificatePayload) => updateMutation.mutateAsync(payload),
    isUpdating: updateMutation.isPending,
  };
};
