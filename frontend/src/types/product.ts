import type { ApiResponse } from "./api";
import type { BranchStock } from "./branch";
import type { Category } from "./cate";

export type Product = {
  id: number;
  productName: string;
  brand: string;
  thumbnailUrl: string;
  createdDate: string;
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
  cateId?: number;
  groupName?: string;
  pricesRange?: string;
  sizes?: string;
  colors?: string;
  materials?: string;
  sort?: string;
  page?: number;
  limit?: number;
  keyword?: string;
  branchId?: string;
  productId?: number;
};

export type ProductVariant = {
  id: number;
  sku: string;
  price: number;
  totalStock: number;
  discount: number;
  color: string;
  size: string;
  material: string;
  discountPrice: number;
  branches: BranchStock[];
};

export type ProductImage = {
  id: number;
  imageUrl: string;
  productId: number;
};

export type ProductDetail = {
  id: number;
  productName: string;
  brand: string;
  description: string;
  variants: ProductVariant[];
  images: ProductImage[];
};

export type ProductDetailResponse = ApiResponse<ProductDetail>;

export type ProductDetailRequest = {
  productId: number;
};

export type ProductFeedbackVariant = {
  id: number;
  color: string;
  size: string;
  material: string;
};

export type ProductFeedbackUser = {
  id: number;
  username: string;
  fullName: string;
  avatar: string;
};

export type ProductFeedback = {
  id: number;
  content: string;
  rating: number;
  updatedDate: string;
  variant: ProductFeedbackVariant;
  user: ProductFeedbackUser;
};

export type ProductFeedbackData = {
  productId: number;
  totalFeedbacks: number;
  averageRating: number;
  page: number;
  limit: number;
  totalPages: number;
  feedbacks: ProductFeedback[];
};

export type ProductFeedbackResponse = ApiResponse<ProductFeedbackData>;

export type ProductFeedbackRequest = {
  productId: number;
  page?: number;
  limit?: number;
  rating?: number;
};

///MANAGER
export type ManagerProductVariant = {
  id: number;
  sku?: string | null;
  price: number;
  discount: number;
  color?: string | null;
  size?: string | null;
  material?: string | null;
  weight: number;
  stockId: number | null;
  branchId: number;
  stock: number;
};

///MANAGER
export type ManagerProductStockUpdateData = ManagerProductVariant & {
  productId: number;
};

///MANAGER
export type ManagerProductStockUpdateRequest = {
  variantId: number;
  stock: number;
};

///MANAGER
export type ManagerProduct = {
  id: number;
  productName: string;
  brand: string;
  description: string;
  thumbnailUrl: string;
  categoryId: number;
  category: {
    id: number;
    cateName: string;
    menuGroup?: string | null;
  } | null;
  branchId: number;
  variantCount: number;
  totalStock: number;
  variants: ManagerProductVariant[];
  createdDate: string;
  updatedDate?: string;
};

///MANAGER
export type ManagerProductListData = {
  branchId: number;
  products: ManagerProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
};

///MANAGER
export type ManagerProductQueries = {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
};

///MANAGER
export type ManagerProductsResponse = ApiResponse<ManagerProductListData>;
export type ManagerProductDetailResponse = ApiResponse<ManagerProduct>;
export type ManagerProductStockUpdateResponse =
  ApiResponse<ManagerProductStockUpdateData>;
