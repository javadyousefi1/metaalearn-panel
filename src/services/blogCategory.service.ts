import { httpService } from './http.service';
import {
  BlogCategory,
  CreateBlogCategoryPayload,
  UpdateBlogCategoryPayload,
} from '@/types/blogCategory.types';

/**
 * Blog Category Service
 *
 * Handles all API calls related to blog categories
 */
export const blogCategoryService = {
  /**
   * Get all blog categories
   * @returns Promise with blog category list
   */
  getAll: async (): Promise<BlogCategory[]> => {
    const response = await httpService.get<BlogCategory[]>(`/BlogCategory/GetAll`);
    return response.data;
  },

  /**
   * Create new blog category
   * @param data - Blog category creation data
   * @returns Promise<void>
   */
  create: async (data: CreateBlogCategoryPayload): Promise<void> => {
    await httpService.post('/BlogCategory/Create', data);
  },

  /**
   * Update existing blog category
   * @param data - Blog category update data
   * @returns Promise<void>
   */
  update: async (data: UpdateBlogCategoryPayload): Promise<void> => {
    await httpService.put('/BlogCategory/Update', data);
  },

  /**
   * Delete blog category by ID
   * @param id - Blog Category ID
   * @returns Promise<void>
   */
  delete: async (id: string): Promise<void> => {
    await httpService.delete(`/BlogCategory/Delete/${id}`);
  },
};
