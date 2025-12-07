import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type {
  CourtListRequest,
  CourtListResponse,
  CourtPriceResponse,
  CourtScheduleInfo,
  CourtScheduleRequest,
  CourtScheduleResponse,
} from "../../../types/court";
import type { ApiErrorType } from "../../../types/error";
import courtService from "../../../services/Customer/courtService";

interface CourtState {
  courts: CourtListResponse | undefined;
  courtSchedule: CourtScheduleResponse | undefined;
  courtPrices: CourtPriceResponse;
  bookingAmount: number;
  loading: boolean;
  error: string | undefined;
}

const initialState: CourtState = {
  courts: undefined,
  courtSchedule: undefined,
  courtPrices: [],
  bookingAmount: 0,
  loading: false,
  error: undefined,
};

export const getCourts = createAsyncThunk<
  CourtListResponse,
  { data: CourtListRequest },
  { rejectValue: ApiErrorType }
>("court/getCourts", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await courtService.getCourtsService(data);
    return res.data as CourtListResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const getCourtSchedule = createAsyncThunk<
  CourtScheduleResponse,
  { data: CourtScheduleRequest },
  { rejectValue: ApiErrorType }
>("court/getCourtSchedule", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await courtService.getCourtScheduleService(data);
    return res.data as CourtScheduleResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const getCourtPrice = createAsyncThunk<
  CourtPriceResponse,
  void,
  { rejectValue: ApiErrorType }
>("court/getCourtPrice", async (_, { rejectWithValue }) => {
  try {
    const res = await courtService.getCourtPriceService();
    return res.data as CourtPriceResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

const courtSlice = createSlice({
  name: "court",
  initialState,
  reducers: {
    clearCourtError(state) {
      state.error = undefined;
    },
    updateBookingAmountLocal(
      state,
      action: PayloadAction<{
        selectedSlots: CourtScheduleInfo[];
        weekday: string;
        courtId: number;
      }>
    ) {
      const toHour = (t: string) => Number(t.split(":")[0]); // "08:00" -> 8
      const { selectedSlots, weekday, courtId } = action.payload;
      if (!state.courtPrices || state.courtPrices.length === 0) return;
      let total = 0;

      selectedSlots.forEach((slot) => {
        const priceItem = state.courtPrices.find(
          (p) =>
            p.dayOfWeek === weekday &&
            toHour(p.startTime) <= toHour(slot.startTime) &&
            toHour(slot.endTime) <= toHour(p.endTime)
        );
        if (priceItem) {
          total += priceItem.price;
        }
      });

      state.bookingAmount = total;

      localStorage.setItem(`bookingAmount_${courtId}`, String(total)); // Lưu lại
    },

    setBookingAmountLocal(state, action: PayloadAction<{ amount: number }>) {
      state.bookingAmount = action.payload.amount;
    },

    clearBookingAmount(state) {
      state.bookingAmount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // getCourts
      .addCase(getCourts.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(getCourts.fulfilled, (state, action) => {
        state.courts = action.payload;
        state.loading = false;
      })
      .addCase(getCourts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.userMessage;
      })

      // getCourtSchedule
      .addCase(getCourtSchedule.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(getCourtSchedule.fulfilled, (state, action) => {
        state.courtSchedule = action.payload;
        state.loading = false;
      })
      .addCase(getCourtSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.userMessage;
      })

      // getCourt
      .addCase(getCourtPrice.fulfilled, (state, action) => {
        state.courtPrices = action.payload;
      });
  },
});

export const {
  clearCourtError,
  updateBookingAmountLocal,
  clearBookingAmount,
  setBookingAmountLocal,
} = courtSlice.actions;
export default courtSlice.reducer;
