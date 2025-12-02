import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { ApiErrorType } from "../../../types/error";
import type {
  AddOfflineBookingRequest,
  AddOfflineBookingResponse,
  UpdateOfflineBookingRequest,
  UpdateOfflineBookingResponse,
} from "../../../types/offline";
import offlineBookingService from "../../../services/Employee/offlineService";

interface OfflineState {
  offlineBooking: AddOfflineBookingResponse | undefined;
  message: string | undefined;
  loading: boolean;
  error: string | undefined;
}

const initialState: OfflineState = {
  offlineBooking: undefined,
  message: undefined,
  loading: false,
  error: undefined,
};

export const createOfflineBooking = createAsyncThunk<
  AddOfflineBookingResponse,
  { data: AddOfflineBookingRequest },
  { rejectValue: ApiErrorType }
>("offline/createOfflineBooking", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await offlineBookingService.createOfflineBookingService(data);
    return res.data as AddOfflineBookingResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const updateOfflineBooking = createAsyncThunk<
  UpdateOfflineBookingResponse,
  { data: UpdateOfflineBookingRequest },
  { rejectValue: ApiErrorType }
>("offline/updateOfflineBooking", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await offlineBookingService.updateOfflineBookingService(data);
    return res.data as UpdateOfflineBookingResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

const offlineSlice = createSlice({
  name: "offline",
  initialState,
  reducers: {
    clearOfflineError(state) {
      state.error = undefined;
    },
    clearOfflineBooking(state) {
      state.offlineBooking = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      // CreateOffline
      .addCase(createOfflineBooking.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(createOfflineBooking.fulfilled, (state, action) => {
        state.offlineBooking = action.payload;
        state.loading = false;
      })
      .addCase(createOfflineBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.userMessage;
      })

      // UpdateOffline
      .addCase(updateOfflineBooking.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(updateOfflineBooking.fulfilled, (state, action) => {
        state.message = action.payload.message;
        state.loading = false;
      })
      .addCase(updateOfflineBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.userMessage;
      });
  },
});
export const { clearOfflineError, clearOfflineBooking } = offlineSlice.actions;
export default offlineSlice.reducer;
