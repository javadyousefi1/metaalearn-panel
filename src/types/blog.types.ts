// Blog-related type definitions

export interface BlogCategory {
  id: string;
  name: string;
}

export interface BlogPublisherInfo {
  id: string;
  fullNameFa: string;
  imageUrl: string;
}

export interface BlogGalleryItem {
  id: string;
  shareableUrl: string;
  type: number;
  category: number;
}

export interface Blog {
  id: string;
  categoryId?: string;
  category?: BlogCategory;
  name: string;
  description: string;
  publishTime: string;
  shortUrl: string;
  shortText: string;
  fullText?: string;
  keywords: string[];
  favoriteCount?: number;
  publisherInfo?: BlogPublisherInfo;
  gallery?: BlogGalleryItem[];
  isDraft?: boolean;
  isActive?: boolean;
}

export interface BlogListParams {
  PageIndex: number;
  PageSize: number;
}

export interface BlogListResponse {
  items: Blog[];
  totalCount: number;
}

export interface CreateBlogPayload {
  categoryId: string;
  name: string;
  description: string;
  publishTime: string;
  shortUrl: string;
  shortText: string;
  fullText: string;
  keywords: string[];
}

export interface UpdateBlogPayload {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  publishTime: string;
  shortUrl: string;
  shortText: string;
  fullText: string;
  keywords: string[];
  isDraft: boolean;
  isActive: boolean;
}
