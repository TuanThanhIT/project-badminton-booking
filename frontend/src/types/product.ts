import type { ApiResponse } from "./api";
import type { BranchStock } from "./branch";
import type { Category } from "./cate";

export type Product = {
  id: number;
  productName: string;
  brand: string;
  thumbnailUrl: string;
  createdAt: string;
  minPrice: number;
  category: Category;
  discount: number;
  minDiscountedPrice: number;
  isNew: boolean;
  imageSearch?: {
    score?: number;
    reasons?: string[];
    desired_color?: string | null;
  } | null;
};

export type ProductFilterData = {
  products: Product[];
  total: number;
  page: number;
  limit: number;
};

export type ProductFilterResponse = ApiResponse<ProductFilterData>;

export type ProductImageSearchResponse = ApiResponse<
  ProductFilterData & {
    query?: string | null;
    desiredColor?: string | null;
  }
>;

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
  categoryId?: number;
  category?: Category;
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
  updatedAt: string;
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
  stockStatus?: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
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
  stockStatus?: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
  variants: ManagerProductVariant[];
  createdAt: string;
  updatedAt?: string;
};

///MANAGER
export type ManagerProductListData = {
  branchId: number;
  products: ManagerProduct[];
  brands?: string[];
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
  keyword?: string;
  categoryId?: number;
  brand?: string;
  stockStatus?: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
};

///MANAGER
export type ManagerProductsResponse = ApiResponse<ManagerProductListData>;
export type ManagerProductDetailResponse = ApiResponse<ManagerProduct>;
export type ManagerProductStockUpdateResponse =
  ApiResponse<ManagerProductStockUpdateData>;

export type ManagerProductCategory = {
  id: number;
  cateName: string;
  menuGroup?: string | null;
};

export type ManagerProductCategoriesResponse =
  ApiResponse<ManagerProductCategory[]>;
