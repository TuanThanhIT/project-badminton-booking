import type { ApiResponse } from "./api";
export type Branch = {
  id: number;
  branchName: string;
  address: string;
  district: string;
  city: string;
  phoneNumber: string;
};
export type Pagination = {
  page: number;
  limit: number;
  total: number;
};
export type BranchListData = {
  data: Branch[];
  pagination: Pagination;
};
export type BranchListResponse = ApiResponse<BranchListData>;
export type BranchImage = {
  id: number;
  imageUrl: string;
};

export type BranchDetail = {
  id: number;
  branchName: string;
  address: string;
  district: string;
  city: string;
  phoneNumber: string;
  description: string;
  thumbnailUrl: string;
  fullAddress: string;
  images: BranchImage[];
};

export type BranchDetailResponse = ApiResponse<BranchDetail>;
export type BranchesRequest = {
  page?: number;
  limit?: number;
  city?: string;
  district?: string;
};
export type BranchDetailRequest = {
  branchId: number;
};
