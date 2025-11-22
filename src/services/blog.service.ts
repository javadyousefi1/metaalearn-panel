import { httpService } from './http.service';
import {
  Blog,
  BlogListParams,
  BlogListResponse,
  CreateBlogPayload,
  UpdateBlogPayload,
} from '@/types/blog.types';

/**
 * Blog Service
 *
 * Handles all API calls related to blogs
 */
export const blogService = {
  /**
   * Get all blogs
   * @param params - Query parameters (PageIndex, PageSize)
   * @returns Promise with blog list response
   */
  getAll: async (params: BlogListParams): Promise<BlogListResponse> => {
    const response = await httpService.get<BlogListResponse>(
      `/Blog/GetAll`,
      { params }
    );
    return response.data;
  },

  /**
   * Get blog by ID
   * @param id - Blog ID
   * @returns Promise with blog details
   */
  getById: async (id: string): Promise<Blog> => {
    const response = await httpService.get<Blog>(`/Blog/Get?id=${id}`);
    return response.data;
  },

  /**
   * Create new blog
   * @param data - Blog creation data
   * @returns Promise<void>
   */
  create: async (data: CreateBlogPayload): Promise<void> => {
    await httpService.post('/Blog/Create', data);
  },

  /**
   * Update existing blog
   * @param data - Blog update data
   * @returns Promise<void>
   */
  update: async (data: UpdateBlogPayload): Promise<void> => {
    await httpService.put('/Blog/Update', data);
  },

  /**
   * Delete blog by ID
   * @param id - Blog ID
   * @returns Promise<void>
   */
  delete: async (id: string): Promise<void> => {
    await httpService.delete(`/Blog/Delete/${id}`);
  },
};
