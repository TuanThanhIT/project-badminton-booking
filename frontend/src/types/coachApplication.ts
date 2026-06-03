import type { ApiResponse } from "./api";

export type CoachApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

export type CoachApplicationUser = {
  id: number;
  username: string;
  email: string;
  isVerified: boolean;
  fullName?: string | null;
  avatar?: string | null;
  phoneNumber?: string | null;
  role?: string | null;
};

export type CoachApplication = {
  id: number;
  userId: number;
  status: CoachApplicationStatus;
  experienceYears: number;
  certificate?: string | null;
  certificateImages: string[];
  introduction?: string | null;
  phoneContact?: string | null;
  rejectReason?: string | null;
  reviewedBy?: number | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: CoachApplicationUser | null;
};

export type CoachApplicationListData = {
  applications: CoachApplication[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
  pendingCount: number;
};

export type SubmitCoachApplicationPayload = {
  experienceYears: number;
  certificate: string;
  introduction: string;
  phoneContact?: string;
  certificateImages?: string[];
};

export type CoachApplicationResponse = ApiResponse<CoachApplication | null>;
export type CoachApplicationListResponse = ApiResponse<CoachApplicationListData>;
export type CertificateUploadResponse = ApiResponse<{ urls: string[] }>;
