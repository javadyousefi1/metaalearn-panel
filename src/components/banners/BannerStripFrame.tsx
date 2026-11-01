import React from 'react';
import { BANNER_STRIP_LAYOUT } from '@/constants/banner';
import { getBannerStripBackgroundStyle } from '@/utils/banner.utils';

interface BannerStripFrameProps {
  backgroundColor: string;
  imageUrl?: string | null;
  heightPx?: number;
  className?: string;
  children: React.ReactNode;
}

export const BannerStripFrame: React.FC<BannerStripFrameProps> = ({
  backgroundColor,
  imageUrl,
  heightPx = BANNER_STRIP_LAYOUT.heightPx,
  className = '',
  children,
}) => {
  const hasImage = Boolean(imageUrl?.trim());

  return (
    <div
      className={`relative overflow-hidden text-white ${className}`}
      style={{
        height: heightPx,
        ...getBannerStripBackgroundStyle(backgroundColor, imageUrl),
      }}
    >
      {hasImage && <div className="pointer-events-none absolute inset-0 bg-black/30" />}
      {children}
    </div>
  );
};

interface BannerStripContentProps {
  text: string;
  linkText?: string;
  compact?: boolean;
}

export const BannerStripContent: React.FC<BannerStripContentProps> = ({
  text,
  linkText,
  compact = false,
}) => (
  <div
    className={`relative z-10 flex h-full items-center justify-center ${
      compact ? 'gap-1.5 px-2 text-[10px] leading-tight' : 'gap-3 px-12 text-sm leading-snug'
    }`}
  >
    <p className="m-0 line-clamp-1 min-w-0 flex-1 text-center">{text}</p>
    {linkText ? (
      <span
        className={`inline-flex shrink-0 items-center rounded-full bg-white font-bold shadow-sm ${
          compact ? 'px-1.5 py-0.5 text-[9px]' : 'h-7 px-3.5 text-xs'
        }`}
        style={{ color: BANNER_STRIP_LAYOUT.brandPrimary }}
      >
        {linkText}
      </span>
    ) : null}
  </div>
);
