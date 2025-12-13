import type { SimpleCategory } from "./category";
import type { ProductVariant } from "./varient";
import type { ProductImage } from "./productImages";

export type ProductInfo = {
  id: number;
  productName: string;
  brand: string;
  thumbnailUrl: string;
  isNew: boolean;
  minPrice: number;
  discount: number;
  minDiscountedPrice: number;
  category: {
    id: number;
    cateName: string;
  };
};

export type ProductResponse = {
  products: ProductInfo[];
  total: number;
  page: number;
  limit: number;
};

export type ProductParams = {
  category_id?: number;
  group_name?: string;
  price_range?: string;
  size?: string;
  color?: string;
  material?: string;
  sort?: string;
  page?: number;
  limit?: number;
  keyword?: string;
};

export type ProPrams = {
  group_name: string;
};

export type ProductRelatedParams = {
  category_id: number;
  product_id: number;
};

export type ProductVarient = {
  id: number;
  sku: string;
  price: number;
  stock: number;
  discount: number;
  color: string;
  size: string;
  material: string;
  productId: number;
  discountPrice: number;
};
export type ProductEplResponse = {
  productName: string;
  thumbnailUrl: string;
  id: number;
  sku: string;
  price: number;
  stock: number;
  size: string;
  color: string;
  material: string;
}[];

export type ProductEplRequest = {
  keyword: string;
};
//// ADMIN TYPES //////
export type ProductAdminItem = {
  id: number;
  productName: string;
  brand: string;
  thumbnailUrl: string;
  categoryId: number;
  stock: string;
  Category: SimpleCategory;
};

export type Pagination = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type ProductListResponse = {
  statusCode: number;
  message: string;
  products: ProductAdminItem[];
  pagination: Pagination;
};

export type UpdateProductRequest = {
  productName: string;
  brand: string;
  description: string;
  thumbnailUrl?: string; // backend s? gi? ?nh cu n?u kh�ng g?i
  categoryId: number;
};

export type ProductDetailData = {
  id: number;
  productName: string;
  brand: string;
  description: string;
  thumbnailUrl?: string | null;
  categoryId: number;
  createdDate?: string;
  updatedDate?: string;
  Category?: SimpleCategory | null;
  varients?: ProductVariant[]; // optional array
  images?: ProductImage[]; // optional array
};

export type ProductDetailResponse = {
  message: string;
  data: ProductDetailData;
};
