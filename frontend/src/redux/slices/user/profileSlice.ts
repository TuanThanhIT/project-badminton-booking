import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { ApiErrorType } from "../../../types/error";
import type {
  GetMyProfileResponse,
  GetPublicProfileResponse,
  UpdateMyProfileRequest,
  UserProfileData,
} from "../../../types/profile";
import type { PostWithAuthor } from "../../../types/post";
import type { GetPostsResponse } from "../../../types/post";
import profileService from "../../../services/user/profileService";
import postService from "../../../services/user/postService";
import { createComment, repostPost, toggleLike } from "./postSlice";

interface ProfileState {
  myProfile?: UserProfileData;
  publicProfile?: UserProfileData;
  myPosts: PostWithAuthor[];
  publicPosts: PostWithAuthor[];
}

const patchAuthorProfileInPosts = (
  posts: PostWithAuthor[],
  userId: number,
  profile: UserProfileData["profile"],
  username: string,
) =>
  posts.map((post) => {
    if (post.author?.id !== userId) return post;
    return {
      ...post,
      author: {
        ...post.author,
        username: username || post.author.username,
        profile: {
          ...(post.author.profile || {}),
          fullName: profile?.fullName,
          avatar: profile?.avatar || undefined,
        },
      },
    };
  });

const patchPostCounts = (
  posts: PostWithAuthor[],
  postId: number,
  counts: {
    likesCount?: number;
    commentsCount?: number;
    sharesCount?: number;
    likedByMe?: boolean;
    sharedByMe?: boolean;
  },
) => {
  const post = posts.find((item) => item.id === postId);
  if (!post) return;

  if (counts.likesCount !== undefined) post.likesCount = counts.likesCount;
  if (counts.commentsCount !== undefined) post.commentsCount = counts.commentsCount;
  if (counts.sharesCount !== undefined) post.sharesCount = counts.sharesCount;
  if (counts.likedByMe !== undefined) post.likedByMe = counts.likedByMe;
  if (counts.sharedByMe !== undefined) post.sharedByMe = counts.sharedByMe;
};

const initialState: ProfileState = {
  myProfile: undefined,
  publicProfile: undefined,
  myPosts: [],
  publicPosts: [],
};

export const getMyProfile = createAsyncThunk<
  GetMyProfileResponse,
  void,
  { rejectValue: ApiErrorType }
>("profile/getMyProfile", async (_, { rejectWithValue }) => {
  try {
    const res = await profileService.getMyProfileService();
    return res.data as GetMyProfileResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const updateMyProfile = createAsyncThunk<
  GetMyProfileResponse,
  { data: UpdateMyProfileRequest },
  { rejectValue: ApiErrorType }
>("profile/updateMyProfile", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await profileService.updateMyProfileService(data);
    return res.data as GetMyProfileResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const uploadMyAvatar = createAsyncThunk<
  GetMyProfileResponse,
  File,
  { rejectValue: ApiErrorType }
>("profile/uploadMyAvatar", async (file, { rejectWithValue }) => {
  try {
    const res = await profileService.uploadMyAvatarService(file);
    return res.data as GetMyProfileResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const getPublicProfile = createAsyncThunk<
  GetPublicProfileResponse,
  { userId: number },
  { rejectValue: ApiErrorType }
>("profile/getPublicProfile", async ({ userId }, { rejectWithValue }) => {
  try {
    const res = await profileService.getPublicProfileService(userId);
    return res.data as GetPublicProfileResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const getMyPosts = createAsyncThunk<
  GetPostsResponse,
  { userId: number },
  { rejectValue: ApiErrorType }
>("profile/getMyPosts", async ({ userId }, { rejectWithValue }) => {
  try {
    const res = await postService.getPostsService({ authorId: userId, page: 1, limit: 20 });
    return res.data as GetPostsResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const getPublicPosts = createAsyncThunk<
  GetPostsResponse,
  { userId: number },
  { rejectValue: ApiErrorType }
>("profile/getPublicPosts", async ({ userId }, { rejectWithValue }) => {
  try {
    const res = await postService.getPostsService({ authorId: userId, page: 1, limit: 20 });
    return res.data as GetPostsResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearPublicProfileState: (state) => {
      state.publicProfile = undefined;
      state.publicPosts = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMyProfile.fulfilled, (state, action) => {
        const me = action.payload.data;
        state.myProfile = me;
        state.myPosts = patchAuthorProfileInPosts(
          state.myPosts,
          me.id,
          me.profile,
          me.username,
        );
      })
      .addCase(updateMyProfile.fulfilled, (state, action) => {
        const me = action.payload.data;
        state.myProfile = me;
        state.myPosts = patchAuthorProfileInPosts(
          state.myPosts,
          me.id,
          me.profile,
          me.username,
        );
      })
      .addCase(uploadMyAvatar.fulfilled, (state, action) => {
        const me = action.payload.data;
        state.myProfile = me;
        state.myPosts = patchAuthorProfileInPosts(
          state.myPosts,
          me.id,
          me.profile,
          me.username,
        );
      })
      .addCase(getPublicProfile.fulfilled, (state, action) => {
        state.publicProfile = action.payload.data;
      })
      .addCase(getMyPosts.fulfilled, (state, action) => {
        state.myPosts = action.payload.data.data;
      })
      .addCase(getPublicPosts.fulfilled, (state, action) => {
        state.publicPosts = action.payload.data.data;
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { postId } = action.meta.arg;
        const counts = action.payload.data;
        patchPostCounts(state.myPosts, postId, counts);
        patchPostCounts(state.publicPosts, postId, counts);
      })
      .addCase(createComment.fulfilled, (state, action) => {
        const { postId, comment, counts } = action.payload;
        patchPostCounts(state.myPosts, postId, counts);
        patchPostCounts(state.publicPosts, postId, counts);

        const myPost = state.myPosts.find((item) => item.id === postId);
        if (myPost) {
          if (!myPost.comments) myPost.comments = [];
          myPost.comments.push(comment);
        }

        const publicPost = state.publicPosts.find((item) => item.id === postId);
        if (publicPost) {
          if (!publicPost.comments) publicPost.comments = [];
          publicPost.comments.push(comment);
        }
      })
      .addCase(repostPost.fulfilled, (state, action) => {
        const { postId } = action.meta.arg;
        const counts = action.payload.data;
        patchPostCounts(state.myPosts, postId, counts);
        patchPostCounts(state.publicPosts, postId, counts);
      });
  },
});

export const { clearPublicProfileState } = profileSlice.actions;
export default profileSlice.reducer;
