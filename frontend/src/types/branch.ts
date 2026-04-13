import type { ApiResponse } from "./api";

export type Branch = {
  id: number;
  branchName: string;
  address: string;
  district: string;
  city: string;
};

export type BranchResponse = ApiResponse<Branch[]>;
