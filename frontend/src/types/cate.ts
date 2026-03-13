import type { ApiResponse } from "./api";

export type Category = {
  id: number;
  cateName: string;
};

export type CategoryGroup = {
  menuGroup: string;
  items: Category[];
};

export type CategoriesGroupedResponse = ApiResponse<CategoryGroup[]>;
