import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import type {
  CreateFeedbackRequest,
  CreateFeedbackResponse,
  FeedbackDetailRequest,
  FeedbackDetailResponse,
  UpdateFeedbackRequest,
  UpdateFeedbackResponse,
  DeleteFeedbackRequest,
  DeleteFeedbackResponse,
  FeedbackDetailData,
} from "../../../types/feedback";

import type { ApiErrorType } from "../../../types/error";

import feedbackService from "../../../services/user/feedbackService";

interface FeedbackState {
  feedback?: FeedbackDetailData;
  loading: boolean;
}

const initialState: FeedbackState = {
  feedback: undefined,
  loading: false,
};

export const createFeedback = createAsyncThunk<
  CreateFeedbackResponse,
  CreateFeedbackRequest,
  { rejectValue: ApiErrorType }
>("feedback/createFeedback", async (data, { rejectWithValue }) => {
  try {
    const res = await feedbackService.createFeedbackService(data);
    return res.data as CreateFeedbackResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const getFeedbackDetail = createAsyncThunk<
  FeedbackDetailResponse,
  FeedbackDetailRequest,
  { rejectValue: ApiErrorType }
>("feedback/getFeedbackDetail", async (data, { rejectWithValue }) => {
  try {
    const res = await feedbackService.getFeedbackDetailService(data);
    return res.data as FeedbackDetailResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const updateFeedback = createAsyncThunk<
  UpdateFeedbackResponse,
  UpdateFeedbackRequest,
  { rejectValue: ApiErrorType }
>("feedback/updateFeedback", async (data, { rejectWithValue }) => {
  try {
    const res = await feedbackService.updateFeedbackService(data);
    return res.data as UpdateFeedbackResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const deleteFeedback = createAsyncThunk<
  DeleteFeedbackResponse,
  DeleteFeedbackRequest,
  { rejectValue: ApiErrorType }
>("feedback/deleteFeedback", async (data, { rejectWithValue }) => {
  try {
    const res = await feedbackService.deleteFeedbackService(data);
    return res.data as DeleteFeedbackResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

const feedbackSlice = createSlice({
  name: "feedback",
  initialState,
  reducers: {
    clearFeedback: (state) => {
      state.feedback = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      // get detail
      .addCase(getFeedbackDetail.fulfilled, (state, action) => {
        state.feedback = action.payload.data;
      })

      // update
      .addCase(updateFeedback.fulfilled, (state, action) => {
        if (state.feedback) {
          state.feedback.content = action.payload.data.content;
          state.feedback.rating = Number(action.payload.data.rating);
          state.feedback.updatedDate = action.payload.data.updatedDate;
        }
      });
  },
});

export const { clearFeedback } = feedbackSlice.actions;

export default feedbackSlice.reducer;
