import type { ApiResponse } from "./api";

export type CourtStatus = "available" | "booked" | "maintenance" | "ACTIVE";

export type CourtAvailable = {
  id: number;
  courtName: string;
  location: string;
  thumbnailUrl: string;
  totalPrice: number;
  duration: string; // ⚠️ backend trả string
  status: CourtStatus;
};

export type CourtAvailableResponse = ApiResponse<CourtAvailable[]>;

export type GetAvailableCourtsRequest = {
  branchId: number;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
};
export type CourtInfo = {
  id: number;
  branchId: number;
  courtName: string;
  location: string;
};

export type CourtInfoResponse = ApiResponse<CourtInfo[]>;
