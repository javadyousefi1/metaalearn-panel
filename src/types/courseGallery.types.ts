// Course Gallery-related type definitions
import { CourseGalleryItem as BaseCourseGalleryItem } from './course.types';

export enum GalleryType {
  Image = 0,
  Video = 1,
}

export enum GalleryCategory {
  Cover = 0,
  Content = 1,
  Thumbnail = 2,
}

export enum UploadCourseGalleryRequestType {
  Create = 0,
  Update = 1,
}

// Re-export with typed enums
export interface CourseGalleryItem extends Omit<BaseCourseGalleryItem, 'type' | 'category'> {
  type: GalleryType;
  category: GalleryCategory;
}

export interface CourseGalleryListParams {
  CourseId: string;
  PageIndex: number;
  PageSize: number;
}

export interface CourseGalleryListResponse {
  items: CourseGalleryItem[];
  totalCount: number;
}

export interface UploadCourseGalleryPayload {
  courseId: string;
  type: GalleryType;
  category: GalleryCategory;
  requestType: UploadCourseGalleryRequestType;
  file: File;
}

// Helper functions for display
export const getGalleryTypeName = (type: GalleryType): string => {
  switch (type) {
    case GalleryType.Image:
      return 'تصویر';
    case GalleryType.Video:
      return 'ویدیو';
    default:
      return 'نامشخص';
  }
};

export const getGalleryCategoryName = (category: GalleryCategory): string => {
  switch (category) {
    case GalleryCategory.Cover:
      return 'کاور';
    case GalleryCategory.Content:
      return 'محتوا';
    case GalleryCategory.Thumbnail:
      return 'تامبنیل';
    default:
      return 'نامشخص';
  }
};

export const getGalleryCategoryColor = (category: GalleryCategory): string => {
  switch (category) {
    case GalleryCategory.Cover:
      return 'blue';
    case GalleryCategory.Content:
      return 'green';
    case GalleryCategory.Thumbnail:
      return 'orange';
    default:
      return 'default';
  }
};
