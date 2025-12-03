import type { SimpleCategory } from "./category";
import type { ProductVariant } from "./varient";
import type { ProductImage } from "./productImages";
export type ProductResponse = {
  id: number;
  productName: string;
  brand: string;
  thumbnailUrl: string;
  isNew: boolean;
  minPrice: number;
  discount: number;
  minDiscountedPrice: number;
  categoryId: number;
};

export type ProductParams = {
  category_id: number;
  price_range: string | undefined;
  size: string | undefined;
  color: string | undefined;
  material: string | undefined;
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
  thumbnailUrl?: string; // backend sẽ giữ ảnh cũ nếu không gửi
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
