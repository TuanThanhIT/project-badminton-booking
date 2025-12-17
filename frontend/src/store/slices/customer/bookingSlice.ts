import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { ApiErrorType } from "../../../types/error";
import type {
  AddBookingRequest,
  AddBookingResponse,
  BookingCancelRequest,
  BookingCancelResponse,
  BookingListResponse,
} from "../../../types/booking";
import bookingService from "../../../services/customer/bookingService";

interface OrderState {
  bookings: BookingListResponse;
  message: string | undefined;
  addBooking: AddBookingResponse | undefined;
  loading: boolean;
  error: string | undefined;
}

const initialState: OrderState = {
  bookings: [],
  message: undefined,
  addBooking: undefined,
  loading: false,
  error: undefined,
};

export const addBooking = createAsyncThunk<
  AddBookingResponse,
  { data: AddBookingRequest },
  { rejectValue: ApiErrorType }
>("order/addOrder", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await bookingService.createBookingService(data);
    return res.data as AddBookingResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const getBookings = createAsyncThunk<
  BookingListResponse,
  void,
  { rejectValue: ApiErrorType }
>("booking/getBookings", async (_, { rejectWithValue }) => {
  try {
    const res = await bookingService.getBookingService();
    return res.data as BookingListResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const cancelBooking = createAsyncThunk<
  BookingCancelResponse,
  { data: BookingCancelRequest },
  { rejectValue: ApiErrorType }
>("booking/cancelBooking", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await bookingService.cancelBookingService(data);
    return res.data as BookingCancelResponse;
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
    clearBookings(state) {
      state.bookings = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // addBooking
      .addCase(addBooking.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(addBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.addBooking = action.payload;
      })
      .addCase(addBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.userMessage;
      })

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

      // CancelBooking
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
export const { clearBookingsError, clearBookings } = bookingSlice.actions;
export default bookingSlice.reducer;
