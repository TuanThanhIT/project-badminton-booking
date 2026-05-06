import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import monthlyBookingService from "../../../services/user/monthlyBookingService";

import type {
  MonthlyBookingRequest,
  MonthlyBookingResponse,
  CalculateMonthlyBookingRequest,
  MonthlyBookingCalculateResponse,
  MonthlyBookingCalculateData,
} from "../../../types/monthlyBooking";

import type { ApiErrorType } from "../../../types/error";

interface MonthlyBookingState {
  loading: boolean;

  success: boolean;

  calculateData?: MonthlyBookingCalculateData;
}

const initialState: MonthlyBookingState = {
  loading: false,

  success: false,

  calculateData: undefined,
};

// =====================================================
// CREATE MONTHLY BOOKING
// =====================================================

export const createMonthlyBooking = createAsyncThunk<
  MonthlyBookingResponse,
  MonthlyBookingRequest,
  { rejectValue: ApiErrorType }
>("monthlyBooking/create", async (data, { rejectWithValue }) => {
  try {
    const res = await monthlyBookingService.createMonthlyBookingService(data);

    return res.data;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

// =====================================================
// CALCULATE MONTHLY BOOKING
// =====================================================

export const calculateMonthlyBooking = createAsyncThunk<
  MonthlyBookingCalculateResponse,
  CalculateMonthlyBookingRequest,
  { rejectValue: ApiErrorType }
>("monthlyBooking/calculate", async (data, { rejectWithValue }) => {
  try {
    const res =
      await monthlyBookingService.calculateMonthlyBookingService(data);

    return res.data;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

const monthlyBookingSlice = createSlice({
  name: "monthlyBooking",

  initialState,

  reducers: {
    resetMonthlyBookingState: (state) => {
      state.loading = false;

      state.success = false;

      state.calculateData = undefined;
    },
  },

  extraReducers: (builder) => {
    builder

      // =====================================================
      // CREATE
      // =====================================================

      .addCase(createMonthlyBooking.pending, (state) => {
        state.loading = true;

        state.success = false;
      })

      .addCase(createMonthlyBooking.fulfilled, (state) => {
        state.loading = false;

        state.success = true;
      })

      .addCase(createMonthlyBooking.rejected, (state) => {
        state.loading = false;
      })

      // =====================================================
      // CALCULATE
      // =====================================================

      .addCase(calculateMonthlyBooking.pending, (state) => {
        state.loading = true;
      })

      .addCase(calculateMonthlyBooking.fulfilled, (state, action) => {
        state.loading = false;

        state.calculateData = action.payload.data;
      })

      .addCase(calculateMonthlyBooking.rejected, (state) => {
        state.loading = false;

        state.calculateData = undefined;
      });
  },
});

export const { resetMonthlyBookingState } = monthlyBookingSlice.actions;

export default monthlyBookingSlice.reducer;
