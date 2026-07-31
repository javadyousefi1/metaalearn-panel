import React from 'react';
import { Modal, Button, Tag, Typography } from 'antd';
import { ShieldCheck, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { CheckVideoIntegrityResponse } from '@/types/session.types';

interface VideoIntegrityResultModalProps {
  open: boolean;
  result: CheckVideoIntegrityResponse | null;
  onClose: () => void;
}

const DetailRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex items-center justify-between gap-4 px-4 py-3 bg-white even:bg-gray-50/60">
    <span className="text-sm text-gray-500 shrink-0">{label}</span>
    <span className="text-sm font-medium text-gray-800">{children}</span>
  </div>
);

export const VideoIntegrityResultModal: React.FC<VideoIntegrityResultModalProps> = ({
  open,
  result,
  onClose,
}) => {
  if (!result) return null;

  const hasError = !!result.errorMessage;
  const isHealthy = !hasError && result.isHealthy;

  const status = hasError
    ? {
        Icon: AlertCircle,
        title: 'بررسی با خطا مواجه شد',
        description: result.errorMessage!,
        cardClass: 'border-red-100 bg-gradient-to-l from-red-50/80 to-orange-50/40',
        iconWrapClass: 'bg-red-100',
        iconClass: 'text-red-600',
      }
    : isHealthy
      ? {
          Icon: CheckCircle2,
          title: 'ویدیو سالم است',
          description: 'تمام بخش‌های ویدیو در فضای ذخیره‌سازی موجود هستند.',
          cardClass: 'border-green-100 bg-gradient-to-l from-green-50/80 to-emerald-50/40',
          iconWrapClass: 'bg-green-100',
          iconClass: 'text-green-600',
        }
      : {
          Icon: XCircle,
          title: 'ویدیو ناسالم است',
          description: `${result.missingSegmentIndexes.length} بخش از این ویدیو در فضای ذخیره‌سازی یافت نشد.`,
          cardClass: 'border-red-100 bg-gradient-to-l from-red-50/80 to-orange-50/40',
          iconWrapClass: 'bg-red-100',
          iconClass: 'text-red-600',
        };

  const { Icon, title, description, cardClass, iconWrapClass, iconClass } = status;
  const missingSegmentsText =
    result.missingSegmentIndexes.length === 0
      ? '0'
      : result.missingSegmentIndexes.join('، ');

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <div className="flex items-center gap-2">
          <ShieldCheck size={20} className="text-primary" />
          <span>نتیجه بررسی سلامت ویدیو</span>
        </div>
      }
      footer={
        <Button type="primary" onClick={onClose}>
          باشه
        </Button>
      }
      width={480}
      destroyOnClose
    >
      <div className="space-y-4 pt-1">
        <div className={`rounded-xl border p-4 ${cardClass}`}>
          <div className="flex items-start gap-3">
            <div className={`rounded-lg p-2.5 shrink-0 ${iconWrapClass}`}>
              <Icon size={20} className={iconClass} />
            </div>
            <div>
              <Typography.Text strong className="block text-gray-800">
                {title}
              </Typography.Text>
              <Typography.Text type="secondary" className="mt-1 block text-sm leading-relaxed">
                {description}
              </Typography.Text>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200">
          <DetailRow label="مانیفست">
            {result.manifestExists ? (
              <Tag color="green">موجود</Tag>
            ) : (
              <Tag color="red">یافت نشد</Tag>
            )}
          </DetailRow>
          <DetailRow label="تعداد بخش‌های مورد انتظار">
            {result.expectedSegmentCount}
          </DetailRow>
          <DetailRow label="تعداد بخش‌های گم‌شده">
            <span className={result.missingSegmentIndexes.length > 0 ? 'text-red-600' : undefined}>
              {missingSegmentsText}
            </span>
          </DetailRow>
        </div>
      </div>
    </Modal>
  );
};
