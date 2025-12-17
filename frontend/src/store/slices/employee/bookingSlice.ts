import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { ApiErrorType } from "../../../types/error";
import type {
  BookingCancelEplRequest,
  BookingCancelEplResponse,
  BookingCompleteRequest,
  BookingCompleteResponse,
  BookingConfirmRequest,
  BookingConfirmResponse,
  BookingEplRequest,
  BookingListEplResponse,
  CountBookingRequest,
  CountBookingResponse,
} from "../../../types/booking";
import bookingService from "../../../services/employee/bookingService";
import bookingAdminService from "../../../services/admin/bookingService";

type BookingStatus =
  | "Pending"
  | "Paid"
  | "Confirmed"
  | "Completed"
  | "Cancelled";
interface OrderState {
  bookings: BookingListEplResponse | undefined;
  countBookings: CountBookingResponse;
  message: string | undefined;
  loading: boolean;
  error: string | undefined;
}

const initialState: OrderState = {
  bookings: undefined,
  countBookings: [],
  message: undefined,
  loading: false,
  error: undefined,
};

export const getBookings = createAsyncThunk<
  BookingListEplResponse,
  { data: BookingEplRequest },
  { rejectValue: ApiErrorType }
>("booking/getBookings", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await bookingService.getBookings(data);
    return res.data as BookingListEplResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const confirmBooking = createAsyncThunk<
  BookingConfirmResponse,
  { data: BookingConfirmRequest },
  { rejectValue: ApiErrorType }
>("booking/confirmBooking", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await bookingService.confirmBookingService(data);
    return res.data as BookingConfirmResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const completeBooking = createAsyncThunk<
  BookingCompleteResponse,
  { data: BookingCompleteRequest },
  { rejectValue: ApiErrorType }
>("booking/completeBooking", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await bookingService.completeBookingService(data);
    return res.data as BookingCompleteResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const cancelBooking = createAsyncThunk<
  BookingCancelEplResponse,
  { data: BookingCancelEplRequest },
  { rejectValue: ApiErrorType }
>("booking/cancelBooking", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await bookingService.cancelBookingService(data);
    return res.data as BookingCancelEplResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const countBookingByStatus = createAsyncThunk<
  CountBookingResponse,
  { data: CountBookingRequest },
  { rejectValue: ApiErrorType }
>("booking/countBookingByStatus", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await bookingAdminService.countBookingByBookingStatusService(
      data
    );
    return res.data as CountBookingResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    clearBookingsError(state) {
      state.error = undefined;
    },

    updateBookingStatusLocal(
      state,
      action: PayloadAction<{ bookingId: number; bookingStatus: BookingStatus }>
    ) {
      if (!state.bookings) return;

      const { bookingId, bookingStatus } = action.payload;
      const index = state.bookings.bookings.findIndex(
        (n) => n.id === bookingId
      );

      if (index !== -1) {
        state.bookings.bookings[index].bookingStatus = bookingStatus;
      }
    },

    setBookingsLocal(
      state,
      action: PayloadAction<{ prevBookings: BookingListEplResponse }>
    ) {
      state.bookings = action.payload.prevBookings;
    },
  },

  extraReducers: (builder) => {
    builder
      // getBookings
      .addCase(getBookings.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(getBookings.fulfilled, (state, action) => {
        state.bookings = action.payload;
        state.loading = false;
      })
      .addCase(getBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.userMessage;
      })

      //confirmOrder
      .addCase(confirmBooking.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(confirmBooking.fulfilled, (state, action) => {
        state.message = action.payload.message;
        state.loading = false;
      })
      .addCase(confirmBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.userMessage;
      })

      //completeOrder
      .addCase(completeBooking.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(completeBooking.fulfilled, (state, action) => {
        state.message = action.payload.message;
        state.loading = false;
      })
      .addCase(completeBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.userMessage;
      })

      //cancelOrder
      .addCase(cancelBooking.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.userMessage;
      })

      // countBooking
      .addCase(countBookingByStatus.fulfilled, (state, action) => {
        state.countBookings = action.payload;
      });
  },
});

export const {
  clearBookingsError,
  updateBookingStatusLocal,
  setBookingsLocal,
} = bookingSlice.actions;
export default bookingSlice.reducer;
