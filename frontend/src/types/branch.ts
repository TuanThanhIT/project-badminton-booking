import type { ApiResponse } from "./api";

// 🔥 FULL BRANCH
export type Branch = {
  id: number;
  branchName: string;
  address: string;
  district: string;
  city: string;
  phoneNumber: string;
};

// 🔥 BASIC BRANCH (đã đổi tên)
export type BranchBasic = {
  id: number;
  branchName: string;
  address: string;
  district: string;
  city: string;
};

export type BranchResponse = ApiResponse<BranchBasic[]>;

// ================= OTHER TYPES =================

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

export type BranchSimple = {
  id: number;
  branchName: string;
};

export type BranchSimpleListResponse = ApiResponse<BranchSimple[]>;

// ================= COURT =================

export type CourtStatus = "available" | "booked" | "maintenance";

export type CourtAvailable = {
  id: number;
  courtName: string;
  location: string;
  thumbnailUrl: string;
  totalPrice: number;
  duration: string;
  status: CourtStatus;
};

export type CourtAvailableResponse = ApiResponse<CourtAvailable[]>;

export type GetAvailableCourtsRequest = {
  branchId: number;
  date: string;
  startTime: string;
  endTime: string;
};
