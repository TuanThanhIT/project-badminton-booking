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
  type PostFilterData,
} from "../../../types/post";
import postService from "../../../services/user/postService";
import postSocialService from "../../../services/user/postSocialService";

interface PostState {
  posts: PostFilterData;
  lastCreatedPost?: Post;
  lastGetPostsQuery?: GetPostsQuery;
}

const initialState: PostState = {
  posts: { posts: [], total: 0, page: 1, limit: 10 },
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
  { data: CreateCommentRequest },
  { rejectValue: ApiErrorType }
>("post/createComment",
  async ({ data }, { rejectWithValue }) => {
    try {
      const { postId } = data;
      const res = await postSocialService.createCommentService({
        postId,
        content: data.content,
        parentId: data.parentId ?? undefined,
      });
      const resData = res.data.data as { comment: PostComment } & PostCounts;

      const counts: PostCounts = {
        likesCount: resData.likesCount,
        commentsCount: resData.commentsCount,
        sharesCount: resData.sharesCount,
        likedByMe: resData.likedByMe,
        sharedByMe: resData.sharedByMe ?? false,
      };

      return { postId, comment: resData.comment, counts };
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
        state.posts.posts.unshift(post as PostWithAuthor);
      })
      .addCase(getPosts.fulfilled, (state, action) => {
        const { data, total, page, limit } = action.payload.data;
        state.posts = { posts: data, total, page, limit };
        state.lastGetPostsQuery = action.meta.arg.params;
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { postId } = action.meta.arg;
        const post = state.posts.posts.find((p) => p.id === postId);
        if (!post) return;
        const counts = action.payload.data;
        post.likesCount = counts.likesCount;
        post.commentsCount = counts.commentsCount;
        post.sharesCount = counts.sharesCount;
        post.likedByMe = counts.likedByMe;
        post.sharedByMe = counts.sharedByMe;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        const { postId, comment, counts } = action.payload;
        const post = state.posts.posts.find((p) => p.id === postId);
        if (!post) return;
        post.commentsCount = counts.commentsCount;
        if (!post.comments) post.comments = [];
        post.comments.push(comment);
      })
      .addCase(repostPost.fulfilled, (state, action) => {
        const { postId } = action.meta.arg;
        const post = state.posts.posts.find((p) => p.id === postId);
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
        const idx = state.posts.posts.findIndex((p) => p.id === updated.id);
        if (idx >= 0) {
          state.posts.posts[idx] = { ...state.posts.posts[idx], ...updated };
        }
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        const { postId } = action.payload;
        const before = state.posts.posts.length;
        state.posts.posts = state.posts.posts.filter((p) => p.id !== postId);
        if (state.posts.posts.length !== before) {
          state.posts.total = Math.max(0, state.posts.total - 1);
        }
      });

  },
});

export const { clearLastCreatedPost } = postSlice.actions;
export default postSlice.reducer;