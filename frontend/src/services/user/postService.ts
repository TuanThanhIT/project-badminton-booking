import type {
  CreatePostRequest,
  CreatePostResponse,
  GetPostsQuery,
  GetPostsResponse,
} from "../../types/post";
import instance from "../../utils/axiosCustomize";

const createPostService = (data: CreatePostRequest) =>
  instance.post<CreatePostResponse>("/user/posts", data);

const getPostsService = (data?: GetPostsQuery) =>
  instance.get<GetPostsResponse>("/user/posts", { params:data });

const postService = {
  createPostService,
  getPostsService,
};

export default postService;