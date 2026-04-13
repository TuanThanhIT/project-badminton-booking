import type { ApiResponse } from "./api";

export type CourtInfo = {
  id: number;
  branchId: number;
  courtName: string;
  location: string;
};

export type CourtInfoResponse = ApiResponse<CourtInfo[]>;
