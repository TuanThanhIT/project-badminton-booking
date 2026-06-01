import type { ApiResponse } from "./api";

export type PostType =
  | "FIND_PLAYER"
  | "TOURNAMENT"
  | "GROUP"
  | "FIND_COACH"
  | "CLASS";

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
    level: "Mới chơi" | "Trung bình" | "Cao" | "Tùy chỉnh";
    // Match Zod schema: customLevel is optional (can be missing) and nullable.
    customLevel?: string | null;
    slotsNeeded: number;
  };
  contact: {
    inApp: boolean;
    phone?: string | null;
    zalo?: string | null;
  };
  notes?: string | null;
};

export type ClassFormData = {
  /** Mới chơi | Trung bình | Nâng cao — khớp filter feed */
  inputLevel: string;
  /** Mô tả độ tuổi tự do (vd "6–25 tuổi") — lọc feed tìm chuỗi con */
  ageRange: string;

  /** Lịch cố định: thứ trong tuần + ngày bắt đầu khóa + khung giờ mỗi buổi */
  schedule: {
    weekdays: number[]; // mảng các số 1..7
    startTime: string;
    endTime: string;
    startDate: string;
  };

  /** Chỉ chi nhánh — địa điểm lấy từ thông tin chi nhánh */
  location: {
    branchId: number;
  };

  maxStudents: number;

  /** Học phí mô tả một dòng (vd "2tr/khóa", "500k/tháng × 3 tháng") */
  tuitionFee: string;

  contact: {
    inAppChat: boolean;
    phone?: string | null;
    zalo?: string | null;
  };

  notes?: string | null;
};

export type FindCoachFormData = {
  location: {
    branchId: number;
  };
  currentLevel: string;
  goal: string;
  scheduleNote: string;
  budget?: string | null;
  contact: {
    inApp: boolean;
    phone?: string | null;
    zalo?: string | null;
  };
  notes?: string | null;
};

export type TournamentFormData = {
  organizerName: string;
  location: {
    branchId: number;
    courtId: number;
  };
  registration: {
    startDate: string;
    endDate: string;
  };
  eventDate: string;
  categories: string[];
  contact: {
    phone?: string | null;
    email?: string | null;
    inApp: boolean;
  };
};

export type GroupFormData = {
  area: {
    city: string;
    district: string;
  };
  weeklySchedule: {
    weekdays: number[];
    startTime: string;
    endTime: string;
  };
  /** Khớp filter feed: Mới chơi | Trung bình | Cao */
  levelWanted: "Mới chơi" | "Trung bình" | "Cao";
  contact: {
    inApp: boolean;
    zaloGroupLink?: string | null;
  };
};

export type Post = {
  id: number;
  authorId: number;
  type: PostType;
  title: string;
  content?: string | null;
  formData?:
    | FindPlayerFormData
    | ClassFormData
    | FindCoachFormData
    | TournamentFormData
    | GroupFormData
    | null;
  comments?: PostComment[];
  repostOfPostId?: number | null;
  isRepost?: boolean;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  // Social counts (được trả từ API getPosts)
  likesCount?: number;
  commentsCount?: number;
  sharesCount?: number;
  // Đã like bởi người đang đăng nhập hay chưa
  likedByMe?: boolean | number;
  // Đã share bài gốc tương ứng hay chưa
  sharedByMe?: boolean | number;
};

export type PostFormData =
  | FindPlayerFormData
  | ClassFormData
  | FindCoachFormData
  | TournamentFormData
  | GroupFormData;

export type CreatePostRequest = {
  title: string;
  content?: string;
  type: PostType;
  formData?: PostFormData | null;
};

export type CreatePostResponse = ApiResponse<Post>;
export type UpdatePostRequest = {
  title?: string;
  content?: string;
  formData?: PostFormData | null;
};

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

export interface PostWithAuthor extends Post {
  author?: PostAuthor;
}

export type PostComment = {
  id: number;
  authorId: number;
  postId: number;
  parentId?: number | null;
  content: string;
  type: string;
  createdAt: string;
  author?: {
    id: number;
    username: string;
    email?: string;
    profile?: {
      fullName?: string;
      avatar?: string;
    } | null;
  };
};

export type PostCounts = {
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  likedByMe: boolean;
  sharedByMe: boolean;
};

export type CreateCommentPayload = {
  postId: number;
  comment: PostComment;
  counts: PostCounts;
};

// Query params cho get list posts
export type GetPostsQuery = {
  page?: number;
  limit?: number;
  type?: PostType;
  authorId?: number;
  search?: string;
  hideReposts?: boolean | 0 | 1 | "0" | "1" | "true" | "false";
  /** formData filter: { "formData[location.branchId]": 4 } */
  [key: string]: string | number | boolean | undefined;
};

// Response paginated từ API get posts
export type GetPostsData = {
  total: number;
  page: number;
  limit: number;
  data: PostWithAuthor[];
};

export type CreateCommentRequest = {
  postId: number;
  content: string;
  parentId?: number | null;
};

export type PostFilterData = {
  posts: PostWithAuthor[];
  total: number;
  page: number;
  limit: number;
}

export type GetPostsResponse = ApiResponse<GetPostsData>;
