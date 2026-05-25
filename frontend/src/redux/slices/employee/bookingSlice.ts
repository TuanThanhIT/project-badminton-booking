import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import employeeBookingService from "../../../services/employee/bookingService";
import type {
  CompleteEmployeeBookingRequest,
  EmployeeBooking,
  EmployeeBookingActionResponse,
  EmployeeBookingDetailResponse,
  EmployeeBookingsData,
  EmployeeBookingsRequest,
  EmployeeBookingsResponse,
  RejectEmployeeBookingActionRequest,
} from "../../../types/booking";
import type { ApiErrorType } from "../../../types/error";

type EmployeeBookingState = {
  bookings: EmployeeBooking[];
  selectedBooking: EmployeeBooking | null;
  summary: EmployeeBookingsData["summary"];
  pagination: EmployeeBookingsData["pagination"];
};

const initialState: EmployeeBookingState = {
  bookings: [],
  selectedBooking: null,
  summary: {},
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  },
};

export const getEmployeeBookings = createAsyncThunk<
  EmployeeBookingsResponse,
  { params: EmployeeBookingsRequest },
  { rejectValue: ApiErrorType }
>("employeeBooking/getEmployeeBookings", async ({ params }, { rejectWithValue }) => {
  try {
    const res = await employeeBookingService.getBookingsService(params);
    return res.data;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const getEmployeeBookingDetail = createAsyncThunk<
  EmployeeBookingDetailResponse,
  { bookingId: number },
  { rejectValue: ApiErrorType }
>(
  "employeeBooking/getEmployeeBookingDetail",
  async ({ bookingId }, { rejectWithValue }) => {
    try {
      const res = await employeeBookingService.getBookingDetailService(bookingId);
      return res.data;
    } catch (error) {
      return rejectWithValue(error as ApiErrorType);
    }
  },
);

const actionThunk = (
  type: string,
  fn: (
    bookingId: number,
    data?: RejectEmployeeBookingActionRequest,
  ) => Promise<{ data: EmployeeBookingActionResponse }>,
) =>
  createAsyncThunk<
    EmployeeBookingActionResponse,
    { bookingId: number; data?: RejectEmployeeBookingActionRequest },
    { rejectValue: ApiErrorType }
  >(type, async ({ bookingId, data }, { rejectWithValue }) => {
    try {
      const res = await fn(bookingId, data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error as ApiErrorType);
    }
  });

export const approveCancelEmployeeBooking = actionThunk(
  "employeeBooking/approveCancelEmployeeBooking",
  (bookingId) => employeeBookingService.approveCancelBookingService(bookingId),
);

export const confirmEmployeeBooking = actionThunk(
  "employeeBooking/confirmEmployeeBooking",
  (bookingId) => employeeBookingService.confirmBookingService(bookingId),
);

export const completeEmployeeBooking = createAsyncThunk<
  EmployeeBookingActionResponse,
  { bookingId: number; data?: CompleteEmployeeBookingRequest },
  { rejectValue: ApiErrorType }
>(
  "employeeBooking/completeEmployeeBooking",
  async ({ bookingId, data }, { rejectWithValue }) => {
    try {
      const res = await employeeBookingService.completeBookingService(
        bookingId,
        data,
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(error as ApiErrorType);
    }
  },
);

export const rejectCancelEmployeeBooking = actionThunk(
  "employeeBooking/rejectCancelEmployeeBooking",
  (bookingId, data) =>
    employeeBookingService.rejectCancelBookingService(bookingId, data),
);

export const cancelNoShowEmployeeBooking = actionThunk(
  "employeeBooking/cancelNoShowEmployeeBooking",
  (bookingId, data) =>
    employeeBookingService.cancelNoShowBookingService(bookingId, data),
);

const upsertBooking = (
  bookings: EmployeeBooking[],
  booking: EmployeeBooking,
) => {
  const existed = bookings.some((item) => item.id === booking.id);
  if (!existed) return bookings;
  return bookings.map((item) => (item.id === booking.id ? booking : item));
};

const employeeBookingSlice = createSlice({
  name: "employeeBooking",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getEmployeeBookings.fulfilled, (state, action) => {
        state.bookings = action.payload.data.items;
        state.summary = action.payload.data.summary;
        state.pagination = action.payload.data.pagination;
      })
      .addCase(getEmployeeBookingDetail.fulfilled, (state, action) => {
        state.selectedBooking = action.payload.data;
        state.bookings = upsertBooking(state.bookings, action.payload.data);
      });
  },
});

export default employeeBookingSlice.reducer;
