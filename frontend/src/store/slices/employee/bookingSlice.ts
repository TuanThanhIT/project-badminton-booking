import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
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
} from "../../../types/booking";
import bookingService from "../../../services/Employee/bookingService";

interface OrderState {
  bookings: BookingListEplResponse | undefined;
  message: string | undefined;
  loading: boolean;
  error: string | undefined;
}

const initialState: OrderState = {
  bookings: undefined,
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

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    clearBookingsError(state) {
      state.error = undefined;
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
      });
  },
});
export const { clearBookingsError } = bookingSlice.actions;
export default bookingSlice.reducer;
