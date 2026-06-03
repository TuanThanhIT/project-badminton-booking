import instance from "../../utils/axiosCustomize";

const getPostsService = (params: {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  isActive?: string;
  isDeleted?: string;
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

const adminPostService = {
  getPostsService,
  togglePostActiveService,
  deletePostService,
  getCommentsService,
  deleteCommentService,
};

export default adminPostService;
