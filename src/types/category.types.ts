export interface Category {
  id: string;
  name: string;
  parent: CategoryParent | null;
  subCategories: SubCategory[] | null;
}

export interface CategoryParent {
  name: string | null;
  id: string | null;
}

export interface SubCategory {
  name: string;
  id: string;
  subCategories?: SubCategory[] | null;
}

export interface CreateCategoryPayload {
  name: string;
  parentId?: string;
}

export interface UpdateCategoryPayload {
  id: string;
  name: string;
  parentId?: string;
}

export interface CategoryListItem {
  name: string;
  subCategories: SubCategory[] | null;
  id: string;
}
