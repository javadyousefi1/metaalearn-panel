// Blog Category-related type definitions

export interface BlogCategory {
  id: string;
  name: string;
  parentId?: string | null;
  subCategories?: string[];
}

export interface CreateBlogCategoryPayload {
  name: string;
  parentId?: string | null;
}

export interface UpdateBlogCategoryPayload {
  id: string;
  name: string;
  parentId?: string | null;
}
