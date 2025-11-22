// Blog Gallery-related type definitions
import { GalleryType, GalleryCategory, UploadCourseGalleryRequestType } from './courseGallery.types';

export interface BlogGalleryItem {
  id: string;
  shareableUrl: string;
  type: GalleryType;
  category: GalleryCategory;
}

export interface BlogGalleryListParams {
  BlogId: string;
  PageIndex: number;
  PageSize: number;
}

export interface BlogGalleryListResponse {
  items: BlogGalleryItem[];
  totalCount: number;
}

export interface UploadBlogGalleryPayload {
  blogId: string;
  type: GalleryType;
  category: GalleryCategory;
  requestType: UploadCourseGalleryRequestType;
  file: File;
  id?: string; // Optional: Gallery item ID for update operations
}
