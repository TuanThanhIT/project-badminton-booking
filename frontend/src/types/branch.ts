import type { ApiResponse } from "./api";

export type BranchOptions = {
  id: number;
  branchName: string;
};

export type BranchStock = {
  id: number;
  branchName: string;
  stock: number;
};

export type BranchOptionsListResponse = ApiResponse<BranchOptions[]>;

export type Pagination = {
  page: number;
  limit: number;
  total: number;
};

export type Branch = {
  id: number;
  branchName: string;
  address: string;
  wardName: string;
  districtName: string;
  provinceName: string;
  phoneNumber: string;
  latitude: number;
  longitude: number;
  fullAddress: string;
};

export type BranchListData = {
  branches: Branch[];
  pagination: Pagination;
};

export type BranchListResponse = ApiResponse<BranchListData>;

export type BranchImage = {
  id: number;
  imageUrl: string;
};

export type BranchManager = {
  email: string;
  fullName: string;
  phoneNumber: string;
};

export type BranchDetail = {
  id: number;
  branchName: string;
  phoneNumber: string;
  description: string;
  latitude: number;
  longitude: number;
  fullAddress: string;
  images: BranchImage[];
  managers: BranchManager[];
};

export type BranchDetailResponse = ApiResponse<BranchDetail>;

export type BranchesRequest = {
  page?: number;
  limit?: number;
  provinceName?: string;
  districtName?: string;
};

export type BranchDetailRequest = {
  branchId: number;
};

export type BranchListItem = {
  id: number;
  branchName: string;
  address: string;
  wardName: string;
  districtName: string;
  provinceName: string;
};

export type BranchListItemResponse = ApiResponse<BranchListItem[]>;
