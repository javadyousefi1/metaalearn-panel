import type { CSSProperties } from 'react';
import { DEFAULT_BANNER_BACKGROUND_COLOR } from '@/types/banner.types';

const HEX_FULL = /^#([0-9A-Fa-f]{6})$/;
const HEX_SHORT = /^#([0-9A-Fa-f]{3})$/;

export function resolveBannerBackgroundColor(color?: string | null): string {
  return color?.trim() || DEFAULT_BANNER_BACKGROUND_COLOR;
}

export function normalizeBannerHexColor(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  const withHash = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
  if (HEX_FULL.test(withHash)) {
    return withHash.toUpperCase();
  }

  const short = HEX_SHORT.exec(withHash);
  if (short) {
    const [r, g, b] = short[1].split('');
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }

  return null;
}

export function parseBannerBackgroundColor(value: unknown): string {
  if (typeof value === 'string' && value.trim()) {
    const normalized = normalizeBannerHexColor(value);
    if (normalized) {
      return normalized;
    }
  }

  if (
    value &&
    typeof value === 'object' &&
    'toHexString' in value &&
    typeof (value as { toHexString: () => string }).toHexString === 'function'
  ) {
    return (value as { toHexString: () => string }).toHexString().toUpperCase();
  }

  return DEFAULT_BANNER_BACKGROUND_COLOR;
}

export function getBannerStripBackgroundStyle(
  backgroundColor: string,
  imageUrl?: string | null,
): CSSProperties {
  const hasImage = Boolean(imageUrl?.trim());
  return {
    backgroundColor: resolveBannerBackgroundColor(backgroundColor),
    backgroundImage: hasImage ? `url(${imageUrl})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };
}
