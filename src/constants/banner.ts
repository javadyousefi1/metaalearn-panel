import { DEFAULT_BANNER_BACKGROUND_COLOR } from '@/types/banner.types';

/** Site top strip — keep in sync with `client/src/constants/banner.ts`. */
export const BANNER_STRIP_LAYOUT = {
  heightPx: 52,
  tablePreviewHeightPx: 36,
  brandPrimary: DEFAULT_BANNER_BACKGROUND_COLOR,
} as const;
