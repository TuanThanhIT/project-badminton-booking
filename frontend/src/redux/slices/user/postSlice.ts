import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { ApiErrorType } from "../../../types/error";
import type {
  CreatePostRequest,
  CreatePostResponse,
  GetPostsQuery,
  GetPostsResponse,
  Post,
  PostWithAuthor,
} from "../../../types/post";
import postService from "../../../services/user/postService";

interface PostState {
  posts: PostWithAuthor[];
  total: number;
  page: number;
  limit: number;
  lastCreatedPost?: Post;
}

const initialState: PostState = {
  posts: [],
  total: 0,
  page: 1,
  limit: 10,
  lastCreatedPost: undefined,
};

export const createPost = createAsyncThunk<
  CreatePostResponse,
  { data: CreatePostRequest },
  { rejectValue: ApiErrorType }
>("post/createPost", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await postService.createPostService(data);
    return res.data as CreatePostResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const getPosts = createAsyncThunk<
  GetPostsResponse,
  { params?: GetPostsQuery },
  { rejectValue: ApiErrorType }
>("post/getPosts", async ({ params }, { rejectWithValue }) => {
  try {
    const res = await postService.getPostsService(params);
    return res.data as GetPostsResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    clearLastCreatedPost: (state) => {
      state.lastCreatedPost = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPost.fulfilled, (state, action) => {
        const post = action.payload.data;
        state.lastCreatedPost = post;
        state.posts.unshift(post as PostWithAuthor);
      })
      .addCase(getPosts.fulfilled, (state, action) => {
        const { data, total, page, limit } = action.payload.data;
        state.posts = data;
        state.total = total;
        state.page = page;
        state.limit = limit;
      });
  },
});

export const { clearLastCreatedPost } = postSlice.actions;
export default postSlice.reducer;