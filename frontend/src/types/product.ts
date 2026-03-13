import type { ApiResponse } from "./api";
import type { Category } from "./cate";

export type Product = {
  id: number;
  productName: string;
  brand: string;
  thumbnailUrl: string;
  createdDate: string;
  categoryId: number;
  minPrice: number;
  category: Category;
  discount: number;
  minDiscountedPrice: number;
  isNew: boolean;
};

export type ProductFilterData = {
  products: Product[];
  total: number;
  page: number;
  limit: number;
};

export type ProductFilterResponse = ApiResponse<ProductFilterData>;

export type ProductQueriesRequest = {
  cateId: number;
  groupName?: string;
  pricesRange?: string;
  sizes?: string;
  colors?: string;
  materials?: string;
  sort?: string;
  page?: number;
  limit?: number;
  keyword?: string;
};
