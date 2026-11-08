import React from 'react';
import { BANNER_STRIP_LAYOUT } from '@/constants/banner';
import { BannerStripContent, BannerStripFrame } from '@/components/banners/BannerStripFrame';
import { resolveBannerBackgroundColor } from '@/utils/banner.utils';
import type { Banner } from '@/types/banner.types';

interface BannerTablePreviewProps {
  banner: Pick<Banner, 'backgroundColor' | 'imageUrl' | 'desktopImageUrl' | 'text' | 'linkText'>;
}

/** Compact site-strip preview for the banners table. */
export const BannerTablePreview: React.FC<BannerTablePreviewProps> = ({ banner }) => {
  const bg = resolveBannerBackgroundColor(banner.backgroundColor);
  const label = banner.text?.trim() || '—';

  return (
    <div className="inline-flex w-[176px] max-w-full flex-col items-center gap-1">
      <BannerStripFrame
        backgroundColor={bg}
        imageUrl={banner.desktopImageUrl || banner.imageUrl}
        heightPx={BANNER_STRIP_LAYOUT.tablePreviewHeightPx}
        className="w-full min-w-[176px] rounded-md border border-gray-200/80 shadow-sm"
      >
        <BannerStripContent
          text={label}
          linkText={banner.linkText?.trim() || undefined}
          compact
        />
      </BannerStripFrame>
      <span className="text-center font-mono text-[10px] text-gray-400" dir="ltr">
        {bg}
      </span>
    </div>
  );
};
