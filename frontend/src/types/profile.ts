import type { ApiResponse } from "./api";
import type { AccountStatus } from "./admin";

export type UserProfileData = {
  id: number;
  username: string;
  email: string;
  role?: string;
  createdDate: string;
  accountStatus?: AccountStatus;
  suspendedUntil?: string | null;
  suspensionReason?: string | null;
  violationCount?: number;
  lastViolationAt?: string | null;
  postCount: number;
  profile: {
    fullName: string;
    dob?: string | null;
    gender?: "male" | "female" | "other" | null;
    address?: string | null;
    phoneNumber?: string | null;
    avatar?: string | null;
    level?: string | null;
  } | null;
  coachProfile?: {
    experienceYears?: number | null;
    certificate?: string | null;
    certificateImages?: string[] | null;
    introduction?: string | null;
  } | null;
};

export type GetMyProfileResponse = ApiResponse<UserProfileData>;
export type GetPublicProfileResponse = ApiResponse<UserProfileData>;

export type UpdateMyProfileRequest = {
  fullName?: string;
  dob?: string | null;
  gender?: "male" | "female" | "other" | null;
  address?: string;
  phoneNumber?: string;
  avatar?: string | null;
  level?: string | null;
  coachProfile?: {
    experienceYears?: number;
    certificate?: string | null;
    certificateImages?: string[];
    introduction?: string | null;
  };
};
