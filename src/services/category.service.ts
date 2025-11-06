import { httpService } from './http.service';
import {
  Category,
  CategoryListItem,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '@/types';

/**
 * Category Service
 *
 * Handles all API calls related to course categories
 */
export const categoryService = {
  /**
   * Get all categories
   */
  getAll: async (): Promise<CategoryListItem[]> => {
    const response = await httpService.get<CategoryListItem[]>('/CourseCategory/GetAll');
    return response.data;
  },

  /**
   * Get single category by ID
   */
  getById: async (id: string): Promise<Category> => {
    const response = await httpService.get<Category>(`/CourseCategory/Get/${id}`);
    return response.data;
  },

  /**
   * Create new category
   */
  create: async (data: CreateCategoryPayload): Promise<void> => {
    await httpService.post('/CourseCategory/Create', data);
  },

  /**
   * Update existing category
   */
  update: async (data: UpdateCategoryPayload): Promise<void> => {
    await httpService.put('/CourseCategory/Update', data);
  },

  /**
   * Delete category
   */
  delete: async (id: string): Promise<void> => {
    await httpService.delete(`/CourseCategory/Delete?id=${id}`);
  },
};
