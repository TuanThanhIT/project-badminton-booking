import type {
  CreatePostRequest,
  CreatePostResponse,
  GetPostsQuery,
  GetPostsResponse,
  PostWithAuthor,
  UpdatePostRequest,
} from "../../types/post";
import instance from "../../utils/axiosCustomize";

const createPostService = (data: CreatePostRequest) =>
  instance.post<CreatePostResponse>("/user/posts", data);

const getPostsService = (data?: GetPostsQuery) =>
  instance.get<GetPostsResponse>("/user/posts", { params:data });

const getPostByIdService = (id: number) =>
  instance.get<{ success: boolean; message: string; data: PostWithAuthor }>(
    `/user/posts/${id}`,
  );

const updatePostService = (id: number, data: UpdatePostRequest) =>
  instance.put<{ success: boolean; message: string; data: PostWithAuthor }>(
    `/user/posts/${id}`,
    data,
  );

const deletePostService = (id: number) =>
  instance.delete<{ success: boolean; message: string }>("/user/posts/" + id);

const postService = {
  createPostService,
  getPostsService,
  getPostByIdService,
  updatePostService,
  deletePostService,
};

export default postService;