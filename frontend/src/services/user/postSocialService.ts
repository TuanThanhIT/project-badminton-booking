import instance from "../../utils/axiosCustomize";
import type { ApiResponse } from "../../types/api";
import type { PostComment, PostCounts, Post, CreateCommentRequest } from "../../types/post";

type ToggleLikeResponse = ApiResponse<PostCounts>;

type CreateCommentResponse = ApiResponse<{
  comment: PostComment;
} & PostCounts>;

type GetCommentsResponse = ApiResponse<{
  comments: PostComment[];
}>;

type CreateRepostResponse = ApiResponse<{
  repostPost: Post;
} & PostCounts>;

const toggleLikeService = (postId: number) =>
  instance.post<ToggleLikeResponse>(`/user/posts/${postId}/like`);

const createCommentService = (data: CreateCommentRequest) =>
  instance.post<CreateCommentResponse>(
    `/user/posts/${data.postId}/comments`,data
  );

const getCommentsService = (postId: number) =>
  instance.get<GetCommentsResponse>(`/user/posts/${postId}/comments`);

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

