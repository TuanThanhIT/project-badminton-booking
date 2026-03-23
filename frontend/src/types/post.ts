import type { ApiResponse } from "./api";

export type PostType =
  | "Find_player"
  | "Tournament"
  | "Group"
  | "Find_coach"
  | "Class";

export type FindPlayerFormData = {
  location: {
    branchId: number;
    courtId: number;
  };
  schedule: {
    date: string;
    startTime: string;
    endTime: string;
  };
  playerRequirement: {
    level: "Beginner" | "Intermediate" | "Advanced" | "Custom";
    // Match Zod schema: customLevel is optional (can be missing) and nullable.
    customLevel?: string | null;
    slotsNeeded: number;
  };
  cost: {
    method: string;
    note?: string | null;
  };
  contact: {
    inApp: boolean;
    phone?: string | null;
    zalo?: string | null;
  };
  notes?: string | null;
};

export type ClassFormData = {
  inputLevel: string; // ví dụ "Beginner"
  ageRange: string; // ví dụ "16+"

  schedule: {
    weekdays: number[]; // mảng các số 1..7
    startTime: string;
    endTime: string;
    startDate: string;
  };

  location: {
    branchId: number;
    address: string;
  };

  maxStudents: number;

  tuition: {
    type: string; // ví dụ "monthly"
    amount: number;
    currency: string; // ví dụ "VND"
    note?: string | null;
  };

  registerEndDate: string;
  paymentMethod: string; // ví dụ "onsite"

  contact: {
    inAppChat: boolean;
    phone?: string | null;
    zalo?: string | null;
  };

  notes?: string | null;
};

export type Post = {
  id: number;
  authorId: number;
  type: PostType;
  title: string;
  content?: string | null;
  formData?: FindPlayerFormData | ClassFormData | null;
  isActive: boolean;
  isDeleted: boolean;
  createdDate: string;
  updatedDate: string;
};

export type PostFormData = FindPlayerFormData | ClassFormData;

export type CreatePostRequest = {
  title: string;
  content?: string;
  type: PostType;
  formData?: PostFormData | null;
};

export type CreatePostResponse = ApiResponse<Post>;

// Author + Profile (nested trong Post khi get list/detail)
export type PostAuthor = {
  id: number;
  username: string;
  email?: string;
  profile?: {
    fullName?: string;
    avatar?: string;
  } | null;
};

export type PostWithAuthor = Post & {
  author?: PostAuthor;
};

// Query params cho get list posts
export type GetPostsQuery = {
  page?: number;
  limit?: number;
  type?: PostType;
  search?: string;
  /** formData filter: { "formData[location.branchId]": 4 } */
  [key: string]: string | number | undefined;
};

// Response paginated từ API get posts
export type GetPostsData = {
  total: number;
  page: number;
  limit: number;
  data: PostWithAuthor[];
};

export type GetPostsResponse = ApiResponse<GetPostsData>;