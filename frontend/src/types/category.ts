export type CategoryResponse = {
  menuGroup: string;
  items: [{ id: number; cateName: string }];
};

export type CategoryOtherResponse = {
  id: number;
  cateName: string;
};
export type CategoryItem = {
  id: number;
  cateName: string;
  menuGroup: string;
  createdDate: string;
  updatedDate: string;
};

export type CategoryListResponse = {
  statusCode: number;
  message: string;
  data: CategoryItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};

export type CreateCategoryRequest = {
  cateName: string;
  menuGroup: string;
};

export type UpdateCategoryRequest = {
  cateName?: string;
  menuGroup?: string;
};

export type HandleCreateCategory = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export type SimpleCategory = {
  id: number;
  cateName: string;
};

export type SimpleCategoryListResponse = {
  statusCode: number;
  message: string;
  data: SimpleCategory[];
};
