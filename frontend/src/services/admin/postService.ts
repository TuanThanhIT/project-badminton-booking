import instance from "../../utils/axiosCustomize";

const getPostsService = (params: {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  isActive?: string;
  isDeleted?: string;
  moderationStatus?: string;
  moderationLabel?: string;
}) => instance.get("/admin/posts", { params });

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
}) => instance.get("/admin/comments", { params });

const deleteCommentService = (commentId: number) =>
  instance.delete(`/admin/comments/${commentId}`);

const getPendingModerationPostsService = (params: {
  page?: number;
  limit?: number;
  moderationLabel?: string;
  type?: string;
  keyword?: string;
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
  togglePostActiveService,
  deletePostService,
  getCommentsService,
  deleteCommentService,
  getPendingModerationPostsService,
  getPostModerationDetailService,
  approveModerationPostService,
  rejectModerationPostService,
};

export default adminPostService;
