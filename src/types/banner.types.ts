export enum BannerType {
  Promotional = 1,
  Announcement = 2,
}

/** `imageType` field of `Banner/Upload` */
export enum BannerImageType {
  /** Mobile / default image -> `imageUrl` */
  Image = 1,
  /** Desktop image -> `desktopImageUrl` */
  DesktopImage = 2,
}

export const getBannerTypeLabel = (type: BannerType): string => {
  switch (type) {
    case BannerType.Promotional:
      return 'تبلیغاتی';
    case BannerType.Announcement:
      return 'اطلاع‌رسانی';
    default:
      return 'نامشخص';
  }
};

export const getBannerTypeColor = (type: BannerType): string => {
  switch (type) {
    case BannerType.Promotional:
      return 'blue';
    case BannerType.Announcement:
      return 'purple';
    default:
      return 'default';
  }
};

export const DEFAULT_BANNER_BACKGROUND_COLOR = '#4B26AD';

/** Quick picks for the site top strip (matches brand palette). */
export const BANNER_BACKGROUND_PRESETS = [
  DEFAULT_BANNER_BACKGROUND_COLOR,
  '#087E8B',
  '#0E9C74',
  '#1F2937',
  '#B91C1C',
  '#7C3AED',
] as const;

export interface Banner {
  id: string;
  type: BannerType;
  imageUrl?: string | null;
  desktopImageUrl?: string | null;
  backgroundColor: string;
  text: string;
  linkUrl?: string | null;
  linkText?: string | null;
  isDraft?: boolean | null;
  createdTime?: string | null;
  updatedTime?: string | null;
}

export interface GetAllBannersParams {
  PageIndex?: number;
  PageSize?: number;
  Type?: BannerType;
  IsDraft?: boolean;
}

export interface AllBannersResponse {
  items: Banner[];
  totalCount: number;
}

export interface CreateBannerPayload {
  type: BannerType;
  imageUrl?: string | null;
  desktopImageUrl?: string | null;
  backgroundColor?: string | null;
  text: string;
  linkUrl?: string | null;
  linkText?: string | null;
}

export interface UpdateBannerPayload {
  id: string;
  type?: BannerType;
  imageUrl?: string | null;
  clearImageUrl?: boolean;
  desktopImageUrl?: string | null;
  clearDesktopImageUrl?: boolean;
  backgroundColor?: string | null;
  text?: string;
  linkUrl?: string | null;
  linkText?: string | null;
  isDraft?: boolean;
}

export interface UploadBannerImageResponse {
  imageUrl: string;
}
