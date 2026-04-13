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
      });
  },
});

export const { clearPublicProfileState } = profileSlice.actions;
export default profileSlice.reducer;
