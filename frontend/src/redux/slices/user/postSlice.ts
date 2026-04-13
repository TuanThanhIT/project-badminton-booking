import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { ApiResponse } from "../../../types/api";
import type { ApiErrorType } from "../../../types/error";
import {
  type CreatePostRequest,
  type CreatePostResponse,
  type GetPostsQuery,
  type GetPostsResponse,
  type Post,
  type PostWithAuthor,
  type PostCounts,
  type PostComment,
  type UpdatePostRequest,
  type CreateCommentPayload,
  type CreateCommentRequest,
} from "../../../types/post";
import postService from "../../../services/user/postService";
import postSocialService from "../../../services/user/postSocialService";

interface PostState {
  posts: PostWithAuthor[];
  total: number;
  page: number;
  limit: number;
  lastCreatedPost?: Post;
  lastGetPostsQuery?: GetPostsQuery;
}

const initialState: PostState = {
  posts: [],
  total: 0,
  page: 1,
  limit: 10,
  lastCreatedPost: undefined,
  lastGetPostsQuery: undefined,
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

type ToggleLikeResponse = ApiResponse<PostCounts>;

export const toggleLike = createAsyncThunk<
  ToggleLikeResponse,
  { postId: number },
  { rejectValue: ApiErrorType }
>("post/toggleLike", async ({ postId }, { rejectWithValue }) => {
  try {
    const res = await postSocialService.toggleLikeService(postId);
    return res.data as ToggleLikeResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const createComment = createAsyncThunk<
  CreateCommentPayload,
  CreateCommentRequest,
  { rejectValue: ApiErrorType }
>("post/createComment", 
  async ({ postId, content, parentId }, { rejectWithValue }) => {
    try {
      const res = await postSocialService.createCommentService({
        postId,
        content,
        parentId: parentId ?? undefined,
      });
      const data = res.data.data as { comment: PostComment } & PostCounts;

      const counts: PostCounts = {
        likesCount: data.likesCount,
        commentsCount: data.commentsCount,
        sharesCount: data.sharesCount,
        likedByMe: data.likedByMe,
        sharedByMe: data.sharedByMe ?? false,
      };

      return { postId, comment: data.comment, counts };
    } catch (error) {
      return rejectWithValue(error as ApiErrorType);
    }
}); 

type CreateRepostResponse = ApiResponse<{ repostPost: Post } & PostCounts>;

export const repostPost = createAsyncThunk<
  CreateRepostResponse,
  { postId: number; content?: string },
  { rejectValue: ApiErrorType }
>("post/repostPost", async ({ postId, content }, { rejectWithValue }) => {
  try {
    const res = await postSocialService.createRepostService(postId, content);
    return res.data as CreateRepostResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

type UpdatePostResponse = ApiResponse<PostWithAuthor>;

export const updatePost = createAsyncThunk<
  UpdatePostResponse,
  { postId: number; data: UpdatePostRequest },
  { rejectValue: ApiErrorType }
>("post/updatePost", async ({ postId, data }, { rejectWithValue }) => {
  try {
    const res = await postService.updatePostService(postId, data);
    return res.data as UpdatePostResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const deletePost = createAsyncThunk<
  { postId: number },
  { postId: number },
  { rejectValue: ApiErrorType }
>("post/deletePost", async ({ postId }, { rejectWithValue }) => {
  try {
    await postService.deletePostService(postId);
    return { postId };
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
        // Lưu query cuối để các action like/comment/share có thể refresh lại feed
        state.lastGetPostsQuery = (action.meta.arg as any)?.params;
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { postId } = action.meta.arg as { postId: number };
        const post = state.posts.find((p) => p.id === postId);
        if (!post) return;
        const counts = action.payload.data;
        post.likesCount = counts.likesCount;
        post.commentsCount = counts.commentsCount;
        post.sharesCount = counts.sharesCount;
        post.likedByMe = counts.likedByMe;
        post.sharedByMe = counts.sharedByMe;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        const {postId,comment, counts} = action.payload;
        const post = state.posts.find(p => p.id === postId);
        if(!post) return;
        // update counts
        post.commentsCount = counts.commentsCount;
        // init commnets nếu chưa có 
        if(!post.comments) post.comments = [];
        // thêm comment mới vào post
        post.comments.push(comment);
      })
      .addCase(repostPost.fulfilled, (state, action) => {
        const { postId } = action.meta.arg as { postId: number; content?: string };
        const post = state.posts.find((p) => p.id === postId);
        if (!post) return;
        const counts = action.payload.data;
        post.likesCount = counts.likesCount;
        post.commentsCount = counts.commentsCount;
        post.sharesCount = counts.sharesCount;
        post.likedByMe = counts.likedByMe;
        post.sharedByMe = counts.sharedByMe;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        const updated = action.payload.data;
        const idx = state.posts.findIndex((p) => p.id === updated.id);
        if (idx >= 0) {
          state.posts[idx] = { ...state.posts[idx], ...updated };
        }
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        const { postId } = action.payload;
        const before = state.posts.length;
        state.posts = state.posts.filter((p) => p.id !== postId);
        if (state.posts.length !== before) {
          state.total = Math.max(0, state.total - 1);
        }
      });

  },
});

export const { clearLastCreatedPost } = postSlice.actions;
export default postSlice.reducer;