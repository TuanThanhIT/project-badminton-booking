import type { ApiResponse } from "./api";

export type UserProfileData = {
  id: number;
  username: string;
  email: string;
  createdDate: string;
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
};
