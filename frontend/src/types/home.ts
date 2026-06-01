import type { ApiResponse } from "./api";
import type { Category, CategoryGroup } from "./cate";

export type HomeAction = {
  label: string;
  href: string;
};

export type HomeBanner = {
  id: number;
  title: string;
  subtitle: string;
  imageUrl: string;
  primaryAction: HomeAction;
  secondaryAction: HomeAction;
};

export type HomeBadmintonCategory = {
  id: number;
  title: string;
  groupName: string;
  imageUrl: string;
};

export type HomeBranch = {
  id: number;
  branchName: string;
  phoneNumber: string;
  description?: string;
  fullAddress: string;
  imageUrl: string;
  latitude?: number;
  longitude?: number;

  avgRating: number;
  reviewCount: number;

  bookingCount: number;
  bookingRevenue: number;

  orderCount: number;
  revenue: number;
};

export type HomeProductCategory = Category & {
  menuGroup?: string;
};

export type HomeProduct = {
  id: number;
  productName: string;
  brand: string;
  thumbnailUrl: string;
  createdAt?: string;

  category: HomeProductCategory | null;

  minPrice: number;
  discount: number;
  minDiscountedPrice: number;
  totalStock: number;
  isNew: boolean;

  soldCount: number;
  avgRating: number;
  reviewCount: number;
};

export type HomeNewProductsByGroup = {
  menuGroup: string;
  products: HomeProduct[];
};

export type HomeBestSellingCategory = {
  menuGroup: string;
  categoryId: number;
  cateName: string;
  soldCount: number;
  productCount: number;
};

export type HomeDiscount = {
  id: number;
  code: string;
  type: "AMOUNT" | "PERCENT" | string;
  applyType: "ORDER" | "BOOKING" | "ALL" | string;
  value: number;
  maxDiscount: number | null;
  minAmount: number;
  usageLimit: number | null;
  usageCount: number;
  startDate: string;
  endDate: string;
};

export type HomeDiscountsByApplyType = {
  ORDER: HomeDiscount[];
  BOOKING: HomeDiscount[];
  ALL: HomeDiscount[];
  [key: string]: HomeDiscount[];
};

export type HomeCustomerReviewUser = {
  id: number | null;
  fullName: string;
  avatar: string | null;
};

export type HomeCustomerReviewBranch = {
  id: number;
  branchName: string;
};

export type HomeCustomerReviewProduct = {
  id: number;
  productName: string;
  thumbnailUrl: string;
  variantInfo?: string;
};

export type HomeCustomerReview = {
  id: number;
  targetType: "BRANCH" | "PRODUCT" | string;
  rating: number;
  content: string;
  createdAt?: string;

  user: HomeCustomerReviewUser;
  branch: HomeCustomerReviewBranch | null;
  product: HomeCustomerReviewProduct | null;
};

export type HomeStats = {
  branchCount: number;
  productCount: number;
  categoryGroupCount: number;
  categoryCount: number;
  bookingCount: number;
  orderCount: number;
  reviewCount: number;
  soldCount: number;
};

export type HomeData = {
  banners: HomeBanner[];

  // Danh mục ảnh hard-code cho trang chủ
  badmintonCategories: HomeBadmintonCategory[];

  // Danh mục thật từ database
  categoryGroups: CategoryGroup[];

  // Danh mục bán chạy
  bestSellingCategories: HomeBestSellingCategory[];

  // Sản phẩm mới
  newProducts: HomeProduct[];
  newProductsByGroup: HomeNewProductsByGroup[];

  // Sản phẩm bán chạy
  products: HomeProduct[];
  hotProducts: HomeProduct[];

  // Sản phẩm được đánh giá cao
  topRatedProducts: HomeProduct[];

  // Sản phẩm số lượng có hạn
  lowStockProducts: HomeProduct[];

  // Mã giảm giá
  discounts: HomeDiscount[];
  discountsByApplyType: HomeDiscountsByApplyType;

  // Chi nhánh
  branches: HomeBranch[];
  hotBranches: HomeBranch[];
  mostBookedBranches: HomeBranch[];
  topSellingBranches: HomeBranch[];

  // Feedback khách hàng
  customerReviews: HomeCustomerReview[];

  stats: HomeStats;
};

export type HomeDataResponse = ApiResponse<HomeData>;
