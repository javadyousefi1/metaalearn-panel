import { httpService } from './http.service';
import {
  BlogGalleryListParams,
  BlogGalleryListResponse,
  UploadBlogGalleryPayload,
} from '@/types/blogGallery.types';

/**
 * Blog Gallery Service
 *
 * Handles all API calls related to blog gallery (images/videos)
 */
export const blogGalleryService = {
  /**
   * Get all gallery items for a blog
   * @param params - Query parameters (BlogId, PageIndex, PageSize)
   * @returns Promise with gallery list response
   */
  getAll: async (params: BlogGalleryListParams): Promise<BlogGalleryListResponse> => {
    const response = await httpService.get<BlogGalleryListResponse>(
      `/BlogGallery/GetAll`,
      { params }
    );
    return response.data;
  },

  /**
   * Upload (create or update) a gallery item
   * @param payload - Upload data including file, blogId, type, category, requestType, and optional id for updates
   * @returns Promise<void>
   */
  upload: async (payload: UploadBlogGalleryPayload): Promise<void> => {
    const formData = new FormData();
    formData.append('file', payload.file);
    formData.append('blogId', payload.blogId);
    formData.append('type', payload.type.toString());
    formData.append('category', payload.category.toString());
    formData.append('requestType', payload.requestType.toString());

    // Add ID parameter for update operations
    if (payload.id) {
      formData.append('id', payload.id);
    }

    await httpService.post('/BlogGallery/Upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Delete a gallery item by ID
   * @param id - Gallery Item ID
   * @returns Promise<void>
   */
  delete: async (id: string): Promise<void> => {
    await httpService.delete(`/BlogGallery/Delete/${id}`);
  },
};
