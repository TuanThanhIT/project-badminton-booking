import type { ApiResponse } from "./api";

export type Branch = {
  id: number;
  branchName: string;
};

export type BranchResponse = ApiResponse<Branch[]>;

export type BranchQueryRequest = {
  keyword?: string;
};
