import type { ApiResponse } from "./api";

export type EnrollmentStatus =
  | "PENDING"
  | "ACTIVE"
  | "REJECTED"
  | "COMPLETED"
  | "CANCELLED";

export type ClassEnrollmentStatus = "OPEN" | "LOCKED" | "ENDED";

export type ClassEnrollmentStudent = {
  id: number;
  username: string;
  profile?: {
    fullName?: string;
    avatar?: string | null;
    phoneNumber?: string;
    level?: string;
  } | null;
};

export type ClassEnrollmentItem = {
  id: number;
  postId: number;
  coachUserId: number;
  studentUserId: number;
  status: EnrollmentStatus;
  source: string;
  coachNote?: string | null;
  rejectReason?: string | null;
  createdDate: string;
  updatedDate: string;
  student?: ClassEnrollmentStudent | null;
  post?: {
    id: number;
    title: string;
    formData?: Record<string, unknown> | null;
  } | null;
};

export type CoachDashboard = {
  pending: number;
  active: number;
  classCount: number;
};

export type CoachClassSummary = {
  id: number;
  title: string;
  content?: string | null;
  formData?: Record<string, unknown> | null;
  createdDate: string;
  conversationId?: number | null;
  maxStudents?: number | null;
  enrollmentStatus?: ClassEnrollmentStatus;
  stats: {
    pending: number;
    active: number;
    rejected: number;
    completed: number;
  };
};

export type PostEnrollmentContext = {
  postId: number;
  coachUserId: number;
  maxStudents?: number | null;
  activeCount: number;
  pendingCount: number;
  conversationId?: number | null;
  enrollmentStatus?: ClassEnrollmentStatus;
  canEnroll?: boolean;
  myEnrollment?: ClassEnrollmentItem | null;
  isAuthor: boolean;
};

export type PaginatedEnrollments = {
  total: number;
  page: number;
  limit: number;
  data: ClassEnrollmentItem[];
};

export type CoachDashboardResponse = ApiResponse<CoachDashboard>;
export type CoachClassesResponse = ApiResponse<CoachClassSummary[]>;
export type EnrollmentsResponse = ApiResponse<PaginatedEnrollments>;
export type PostEnrollmentContextResponse = ApiResponse<PostEnrollmentContext>;
export type ClassEnrollmentResponse = ApiResponse<ClassEnrollmentItem>;
export type ConversationIdResponse = ApiResponse<{ conversationId: number }>;
export type NotifyClassResponse = ApiResponse<{
  notifiedCount: number;
  conversationId?: number | null;
}>;

export type ClassStatusResponse = ApiResponse<{
  postId: number;
  enrollmentStatus: ClassEnrollmentStatus;
}>;
