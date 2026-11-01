import React from 'react';
import { BANNER_STRIP_LAYOUT } from '@/constants/banner';
import { BannerStripContent, BannerStripFrame } from '@/components/banners/BannerStripFrame';
import { resolveBannerBackgroundColor } from '@/utils/banner.utils';

interface BannerStripPreviewProps {
  backgroundColor: string;
  imageUrl?: string | null;
  text?: string;
  linkText?: string;
  className?: string;
}

/** Matches client landing `TopBanner` strip. */
export const BannerStripPreview: React.FC<BannerStripPreviewProps> = ({
  backgroundColor,
  imageUrl,
  text = 'پیش‌نمایش نوار بالای سایت',
  linkText,
  className = '',
}) => {
  const bg = resolveBannerBackgroundColor(backgroundColor);

  return (
    <div className={className}>
      <p className="mb-2 text-xs font-medium text-gray-500">
        پیش‌نمایش نوار بالای سایت ({BANNER_STRIP_LAYOUT.heightPx}px)
      </p>
      <BannerStripFrame
        backgroundColor={bg}
        imageUrl={imageUrl}
        className="rounded-lg border border-black/10 shadow-sm"
      >
        <BannerStripContent text={text} linkText={linkText} />
      </BannerStripFrame>
    </div>
  );
};
