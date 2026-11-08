import React from 'react';
import { Button, Tooltip, Upload } from 'antd';
import { ImagePlus } from 'lucide-react';

interface ClubImageUploadButtonProps {
  /** Saved item id; images can only be uploaded for saved items */
  targetId?: string;
  hasImage: boolean;
  uploading: boolean;
  disabled?: boolean;
  label?: { add: string; change: string };
  onSelect: (targetId: string, file: File) => void;
}

export const ClubImageUploadButton: React.FC<ClubImageUploadButtonProps> = ({
  targetId,
  hasImage,
  uploading,
  disabled,
  label = { add: 'آپلود عکس', change: 'تغییر عکس' },
  onSelect,
}) => {
  const isDisabled = !targetId || disabled || uploading;

  return (
    <Tooltip title={targetId ? undefined : 'برای آپلود تصویر، ابتدا تغییرات را ذخیره کنید'}>
      <span>
        <Upload
          accept="image/jpeg,image/png"
          showUploadList={false}
          disabled={isDisabled}
          beforeUpload={(file) => {
            if (targetId) onSelect(targetId, file);
            return false;
          }}
        >
          <Button
            size="small"
            icon={<ImagePlus size={14} />}
            loading={uploading}
            disabled={!targetId || disabled}
          >
            {hasImage ? label.change : label.add}
          </Button>
        </Upload>
      </span>
    </Tooltip>
  );
};
