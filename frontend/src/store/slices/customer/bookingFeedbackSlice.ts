import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { ApiErrorType } from "../../../types/error";
import type {
  AddFeedbackRequest,
  AddFeedbackResponse,
  BookingFeedbackDetailRequest,
  BookingFeedBackDetailResponse,
  BookingFeedbackRequest,
  BookingFeedbackResponse,
  UpdateFeedbackRequest,
  UpdateFeedbackResponse,
} from "../../../types/bookingFeedback";
import bookingFeedbackService from "../../../services/Customer/bookingFeedbackService";

interface BookingFeedbackState {
  bookingFeedbackDetail: BookingFeedBackDetailResponse | undefined;
  bookingFeedbacks: BookingFeedbackResponse;
  message: string | undefined;
  loading: boolean;
  error: string | undefined;
}

const initialState: BookingFeedbackState = {
  bookingFeedbackDetail: undefined,
  bookingFeedbacks: [],
  message: undefined,
  loading: false,
  error: undefined,
};

export const addBookingFeedback = createAsyncThunk<
  AddFeedbackResponse,
  { data: AddFeedbackRequest },
  { rejectValue: ApiErrorType }
>(
  "bookingFeedback/addBookingFeedback",
  async ({ data }, { rejectWithValue }) => {
    try {
      const res = await bookingFeedbackService.createBookingFeedbackService(
        data
      );
      return res.data as AddFeedbackResponse;
    } catch (error) {
      return rejectWithValue(error as ApiErrorType);
    }
  }
);

export const updateBookingFeedback = createAsyncThunk<
  UpdateFeedbackResponse,
  { data: UpdateFeedbackRequest },
  { rejectValue: ApiErrorType }
>(
  "bookingFeedback/updateBookingFeedback",
  async ({ data }, { rejectWithValue }) => {
    try {
      const res = await bookingFeedbackService.updateBookingFeedbackService(
        data
      );
      return res.data as UpdateFeedbackResponse;
    } catch (error) {
      return rejectWithValue(error as ApiErrorType);
    }
  }
);

export const getBookingFeedbackDetail = createAsyncThunk<
  BookingFeedBackDetailResponse,
  { data: BookingFeedbackDetailRequest },
  { rejectValue: ApiErrorType }
>(
  "bookingFeedback/getBookingFeedbackDetail",
  async ({ data }, { rejectWithValue }) => {
    try {
      const res = await bookingFeedbackService.getBookingFeedbackDetailService(
        data
      );
      return res.data as BookingFeedBackDetailResponse;
    } catch (error) {
      return rejectWithValue(error as ApiErrorType);
    }
  }
);

export const getBookingFeedback = createAsyncThunk<
  BookingFeedbackResponse,
  { data: BookingFeedbackRequest },
  { rejectValue: ApiErrorType }
>(
  "bookingFeedback/getBookingFeedback",
  async ({ data }, { rejectWithValue }) => {
    try {
      const res = await bookingFeedbackService.getBookingFeedbackService(data);
      return res.data as BookingFeedbackResponse;
    } catch (error) {
      return rejectWithValue(error as ApiErrorType);
    }
  }
);

const bookingFeedbackSlice = createSlice({
  name: "bookingFeedback",
  initialState,
  reducers: {
    clearBookingFeedbackError(state) {
      state.error = undefined;
    },
    clearBookingFeedbackDetail(state) {
      state.bookingFeedbackDetail = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      // addBookingFeedback
      .addCase(addBookingFeedback.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(addBookingFeedback.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(addBookingFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.userMessage;
      })

      //getBookingFeedbackDetail
      .addCase(getBookingFeedbackDetail.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(getBookingFeedbackDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.bookingFeedbackDetail = action.payload;
      })
      .addCase(getBookingFeedbackDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.userMessage;
      })

      // updateBookingFeedback
      .addCase(updateBookingFeedback.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(updateBookingFeedback.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(updateBookingFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.userMessage;
      })

      // getBookingFeedback
      .addCase(getBookingFeedback.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(getBookingFeedback.fulfilled, (state, action) => {
        state.loading = false;
        state.bookingFeedbacks = action.payload;
      })
      .addCase(getBookingFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.userMessage;
      });
  },
});
export const { clearBookingFeedbackError, clearBookingFeedbackDetail } =
  bookingFeedbackSlice.actions;
export default bookingFeedbackSlice.reducer;
