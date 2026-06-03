import type { ApiResponse } from "./api";

export type UserSearchHit = {
  id: number;
  username: string;
  fullName: string | null;
  avatar: string | null;
  email?: string | null;
  phoneNumber?: string | null;
};

export type UserSearchResponse = ApiResponse<UserSearchHit[]>;
