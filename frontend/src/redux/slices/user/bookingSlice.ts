import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import bookingService from "../../../services/user/bookingService";
import type {
  BookingCallbackRequest,
  BookingCallbackResponse,
  BookingItem,
  BookingPagination,
  CreateBookingRequest,
  CreateBookingResponse,
  MyBookingsRequest,
  MyBookingsResponse,
} from "../../../types/booking";
import type { ApiErrorType } from "../../../types/error";

interface BookingState {
  bookings: BookingItem[];
  pagination?: BookingPagination;
  totalBookings: number;
  paymentUrl?: string;
}

const initialState: BookingState = {
  bookings: [],
  pagination: undefined,
  totalBookings: 0,
  paymentUrl: undefined,
};

export const createBooking = createAsyncThunk<
  CreateBookingResponse,
  { data: CreateBookingRequest },
  { rejectValue: ApiErrorType }
>("booking/createBooking", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await bookingService.createBookingService(data);
    return res.data;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const bookingCallback = createAsyncThunk<
  BookingCallbackResponse,
  { data: BookingCallbackRequest },
  { rejectValue: ApiErrorType }
>("booking/bookingCallback", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await bookingService.bookingCallbackService(data);
    return res.data;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const getMyBookings = createAsyncThunk<
  MyBookingsResponse,
  { data: MyBookingsRequest },
  { rejectValue: ApiErrorType }
>("booking/getMyBookings", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await bookingService.getMyBookingsService(data);
    return res.data;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    clearBookingPaymentUrl(state) {
      state.paymentUrl = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBooking.fulfilled, (state, action) => {
        state.paymentUrl = action.payload.data.paymentUrl;
      })
      .addCase(getMyBookings.fulfilled, (state, action) => {
        state.bookings = action.payload.data.items;
        state.pagination = action.payload.data.pagination;
        if (
          (!action.meta.arg.data.status || action.meta.arg.data.status === "ALL") &&
          !action.meta.arg.data.date
        ) {
          state.totalBookings = action.payload.data.pagination.total;
        }
      });
  },
});

export const { clearBookingPaymentUrl } = bookingSlice.actions;

export default bookingSlice.reducer;
