import React from 'react';
import { Button, Image, Upload } from 'antd';
import { Upload as UploadIcon } from 'lucide-react';

interface BannerImageFieldProps {
  title: React.ReactNode;
  hint: string;
  imageUrl: string | null;
  uploading: boolean;
  disabled?: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
}

/** One banner background image (mobile/default or desktop): upload, preview, remove. */
export const BannerImageField: React.FC<BannerImageFieldProps> = ({
  title,
  hint,
  imageUrl,
  uploading,
  disabled,
  onUpload,
  onRemove,
}) => (
  <div className="rounded-lg border border-dashed border-gray-300 bg-white p-3">
    <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-gray-700">{title}</p>
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        <Upload
          accept="image/jpeg,image/png"
          showUploadList={false}
          beforeUpload={(file) => {
            onUpload(file);
            return false;
          }}
          disabled={disabled || uploading}
        >
          <Button icon={<UploadIcon size={16} />} loading={uploading} disabled={disabled}>
            {imageUrl ? 'تغییر تصویر' : 'آپلود تصویر'}
          </Button>
        </Upload>
        {imageUrl && (
          <Button type="link" danger onClick={onRemove} className="px-1">
            حذف تصویر
          </Button>
        )}
      </div>
      {imageUrl && (
        <Image
          src={imageUrl}
          alt="پیش‌نمایش تصویر بنر"
          className="max-h-24 max-w-full rounded-lg object-cover sm:max-w-[200px]"
        />
      )}
    </div>
    <p className="mb-0 mt-2 text-xs text-gray-500">{hint}</p>
  </div>
);
