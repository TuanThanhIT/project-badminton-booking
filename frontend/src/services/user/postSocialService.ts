import instance from "../../utils/axiosCustomize";
import type { ApiResponse } from "../../types/api";
import type {
  CreateCommentRequest,
  Post,
  PostComment,
  PostCounts,
  PostReactionType,
} from "../../types/post";

type ToggleLikeResponse = ApiResponse<PostCounts>;

type CreateCommentResponse = ApiResponse<{
  comment: PostComment;
} & PostCounts>;

type GetCommentsResponse = ApiResponse<{
  comments: PostComment[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}>;

type CreateRepostResponse = ApiResponse<{
  repostPost: Post;
} & PostCounts>;

const toggleLikeService = (postId: number, reactionType: PostReactionType = "LIKE") =>
  instance.post<ToggleLikeResponse>(`/user/posts/${postId}/like`, {
    reactionType,
  });

const createCommentService = (
  postId: number,
  data: Omit<CreateCommentRequest, "postId">,
) =>
  instance.post<CreateCommentResponse>(
    `/user/posts/${postId}/comments`,data
  );

const getCommentsService = (
  postId: number,
  params?: { page?: number; limit?: number },
) =>
  instance.get<GetCommentsResponse>(`/user/posts/${postId}/comments`, {
    params,
  });

const createRepostService = (postId: number, content?: string) =>
  instance.post<CreateRepostResponse>(`/user/posts/${postId}/repost`, {
    content,
  });

const postSocialService = {
  toggleLikeService,
  createCommentService,
  getCommentsService,
  createRepostService,
};

export default postSocialService;

