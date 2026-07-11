import instance from "../../utils/axiosCustomize";

export type AdminPostAnalyticsTypeRow = {
  type: string;
  totalPosts: number;
  activePosts: number;
  hiddenPosts: number;
  reviewRequiredPosts: number;
  commentCount: number;
  reportCount: number;
};

export type AdminPostAnalyticsFeaturedPost = {
  id: number;
  title: string;
  type: string;
  content?: string | null;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  moderationStatus?: string | null;
  moderationLabel?: string | null;
  moderationConfidence?: number | null;
  moderationReason?: string | null;
  authorUsername?: string;
  authorName?: string;
  commentCount: number;
  reportCount: number;
  hotScore: number;
};

export type AdminPostAnalytics = {
  period: { startDate: string; endDate: string };
  typeBreakdown: AdminPostAnalyticsTypeRow[];
  featuredPosts: AdminPostAnalyticsFeaturedPost[];
  summary: {
    totalPosts: number;
    totalComments: number;
    totalReports: number;
    typeCount: number;
    featuredCount: number;
  };
};

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

const getPostsService = (params: {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  isActive?: string;
  isDeleted?: string;
  moderationStatus?: string;
  moderationLabel?: string;
  startDate?: string;
  endDate?: string;
}) => instance.get("/admin/posts", { params });

const getPostAnalyticsService = (params: {
  startDate?: string;
  endDate?: string;
}) =>
  instance.get<ApiEnvelope<AdminPostAnalytics>>("/admin/posts/analytics", {
    params,
  });

const togglePostActiveService = (postId: number) =>
  instance.put(`/admin/posts/${postId}/toggle-active`);

const deletePostService = (postId: number) =>
  instance.delete(`/admin/posts/${postId}`);

const getCommentsService = (params: {
  page?: number;
  limit?: number;
  search?: string;
  postId?: number;
  commentType?: string;
  postType?: string;
  isActive?: string;
  isDeleted?: string;
  reportFilter?: string;
  startDate?: string;
  endDate?: string;
}) => instance.get("/admin/comments", { params });

const deleteCommentService = (commentId: number) =>
  instance.delete(`/admin/comments/${commentId}`);

const getCommentReportsService = (params: {
  page?: number;
  limit?: number;
  status?: string;
  reason?: string;
  search?: string;
  keyword?: string;
  autoHidden?: string;
  startDate?: string;
  endDate?: string;
}) => instance.get("/admin/comment-reports", { params });

const rejectCommentReportService = (
  reportId: number,
  data?: { adminNote?: string },
) => instance.patch(`/admin/comment-reports/${reportId}/reject`, data || {});

const hideCommentService = (commentId: number, data?: { reason?: string }) =>
  instance.patch(`/admin/comments/${commentId}/hide`, data || {});

const unhideCommentService = (commentId: number, data?: { reason?: string }) =>
  instance.patch(`/admin/comments/${commentId}/unhide`, data || {});

const warnCommentAuthorService = (
  commentId: number,
  data?: { reason?: string; label?: string },
) => instance.post(`/admin/comments/${commentId}/warn-author`, data || {});

const getPendingModerationPostsService = (params: {
  page?: number;
  limit?: number;
  moderationLabel?: string;
  type?: string;
  keyword?: string;
  startDate?: string;
  endDate?: string;
}) => instance.get("/admin/posts/moderation/review", { params });

const getPostModerationDetailService = (postId: number) =>
  instance.get(`/admin/posts/${postId}/moderation`);

const approveModerationPostService = (
  postId: number,
  data: { reason?: string },
) => instance.put(`/admin/posts/${postId}/moderation/approve`, data);

const rejectModerationPostService = (
  postId: number,
  data: { reason?: string; label?: string },
) => instance.put(`/admin/posts/${postId}/moderation/reject`, data);

const adminPostService = {
  getPostsService,
  getPostAnalyticsService,
  togglePostActiveService,
  deletePostService,
  getCommentsService,
  deleteCommentService,
  getCommentReportsService,
  rejectCommentReportService,
  hideCommentService,
  unhideCommentService,
  warnCommentAuthorService,
  getPendingModerationPostsService,
  getPostModerationDetailService,
  approveModerationPostService,
  rejectModerationPostService,
};

export default adminPostService;
