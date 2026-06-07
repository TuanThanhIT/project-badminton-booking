import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { ApiErrorType } from "../../../types/error";
import type {
  GetMyProfileResponse,
  GetPublicProfileResponse,
  UpdateMyProfileRequest,
  UserProfileData,
} from "../../../types/profile";
import type { PostWithAuthor } from "../../../types/post";
import type { GetPostsResponse, PostCounts } from "../../../types/post";
import profileService from "../../../services/user/profileService";
import postService from "../../../services/user/postService";
import { createComment, repostPost, toggleLike } from "./postSlice";
import { login, logoutLocal } from "./authSlice";

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
  counts: PostCounts,
) => {
  const post = posts.find((item) => item.id === postId);
  if (!post) return;

  if (counts.likesCount !== undefined) post.likesCount = counts.likesCount;
  if (counts.commentsCount !== undefined) post.commentsCount = counts.commentsCount;
  if (counts.sharesCount !== undefined) post.sharesCount = counts.sharesCount;
  if (counts.likedByMe !== undefined) post.likedByMe = counts.likedByMe;
  if (counts.sharedByMe !== undefined) post.sharedByMe = counts.sharedByMe;
  if (counts.reactionByMe !== undefined) {
    post.reactionByMe = counts.reactionByMe ?? null;
  }
  if (counts.reactionSummary !== undefined) {
    post.reactionSummary = counts.reactionSummary;
  }
};

const rootPostIdOf = (post: PostWithAuthor) =>
  post.repostOfPostId && post.repostOfPostId > 0 ? post.repostOfPostId : post.id;

const patchRootShareCounts = (
  posts: PostWithAuthor[],
  fallbackPostId: number,
  counts: PostCounts,
) => {
  const selectedPost = posts.find((item) => item.id === fallbackPostId);
  const targetRootId = counts.targetPostId || (selectedPost ? rootPostIdOf(selectedPost) : fallbackPostId);

  posts.forEach((post) => {
    if (rootPostIdOf(post) !== targetRootId) return;
    if (counts.sharesCount !== undefined) post.sharesCount = counts.sharesCount;
    if (counts.sharedByMe !== undefined) post.sharedByMe = counts.sharedByMe;
  });
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

export const uploadCoachCertificateImages = createAsyncThunk<
  GetMyProfileResponse,
  File[],
  { rejectValue: ApiErrorType }
>("profile/uploadCoachCertificateImages", async (files, { rejectWithValue }) => {
  try {
    const res = await profileService.uploadCoachCertificateImagesService(files);
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
    clearMyProfileState: (state) => {
      state.myProfile = undefined;
      state.myPosts = [];
    },
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
      .addCase(uploadCoachCertificateImages.fulfilled, (state, action) => {
        state.myProfile = action.payload.data;
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
      .addCase(login.fulfilled, (state) => {
        state.myProfile = undefined;
        state.myPosts = [];
      })
      .addCase(logoutLocal, (state) => {
        state.myProfile = undefined;
        state.myPosts = [];
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
        patchRootShareCounts(state.myPosts, postId, counts);
        patchRootShareCounts(state.publicPosts, postId, counts);

        const repost = action.payload.data.repostPost as PostWithAuthor;
        if (!repost) return;

        if (
          state.myProfile?.id === repost.authorId &&
          !state.myPosts.some((post) => post.id === repost.id)
        ) {
          state.myPosts.unshift(repost);
        }

        if (
          state.publicProfile?.id === repost.authorId &&
          !state.publicPosts.some((post) => post.id === repost.id)
        ) {
          state.publicPosts.unshift(repost);
        }
      });
  },
});

export const { clearMyProfileState, clearPublicProfileState } = profileSlice.actions;
export default profileSlice.reducer;
