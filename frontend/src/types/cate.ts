import type { ApiResponse } from "./api";

export type Category = {
  id: number;
  cateName: string;
  menuGroup?: string | null;
};

export type CategoryGroup = {
  menuGroup: string;
  items: Category[];
};

export type CategoriesGroupedResponse = ApiResponse<CategoryGroup[]>;

export type OtherCategoriesResponse = ApiResponse<Category[]>;

export type OtherCatesParamsRequest = {
  cateId: number;
};

export type CategoriesByGroupRequest = {
  groupName: string;
};
