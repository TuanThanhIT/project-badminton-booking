import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { ApiErrorType } from "../../../types/error";
import type {
  UpdateWorkShiftRequest,
  UpdateWorkShiftResponse,
  WorkShiftRequest,
  WorkShiftResponse,
} from "../../../types/workShift";
import workShiftService from "../../../services/Employee/workShiftService";

interface WorkShiftState {
  workShifts: WorkShiftResponse[];
  workShift: WorkShiftResponse | undefined;
  message: string | undefined;
  loading: boolean;
  error: string | undefined;
}

const initialState: WorkShiftState = {
  workShifts: [],
  workShift: undefined,
  message: undefined,
  loading: false,
  error: undefined,
};

export const getWorkShifts = createAsyncThunk<
  WorkShiftResponse[],
  { data: WorkShiftRequest },
  { rejectValue: ApiErrorType }
>("workShift/getWorkShifts", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await workShiftService.getWorkShiftByDateService(data);
    return res.data as WorkShiftResponse[];
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const updateWorkShift = createAsyncThunk<
  UpdateWorkShiftResponse,
  { data: UpdateWorkShiftRequest },
  { rejectValue: ApiErrorType }
>("workShift/updateWorkShift", async ({ data }, { rejectWithValue }) => {
  try {
    const res =
      await workShiftService.updateWorkShiftEmployeeAndCashRegisterService(
        data
      );
    return res.data as UpdateWorkShiftResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});
const workShiftSlice = createSlice({
  name: "workShift",
  initialState,
  reducers: {
    clearWorkShiftError(state) {
      state.error = undefined;
    },
    getWorkShift(state, action: PayloadAction<{ nowTime: string }>) {
      const workShifts = state.workShifts;
      const { nowTime } = action.payload;
      // Chia giờ hiện tại thành số để so sánh
      const [nowH, nowM, nowS] = nowTime.split(":").map(Number);
      const nowInSeconds = nowH * 3600 + nowM * 60 + nowS;
      // Tìm ca hiện tại
      const currentShift = workShifts.find((w) => {
        const [startH, startM, startS] = w.startTime.split(":").map(Number);
        const [endH, endM, endS] = w.endTime.split(":").map(Number);

        const startInSeconds = startH * 3600 + startM * 60 + startS;
        const endInSeconds = endH * 3600 + endM * 60 + endS;

        return nowInSeconds >= startInSeconds && nowInSeconds < endInSeconds;
      });
      state.workShift = currentShift;
    },
  },
  extraReducers: (builder) => {
    builder
      // getProductFeedback
      .addCase(getWorkShifts.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(getWorkShifts.fulfilled, (state, action) => {
        state.loading = false;
        state.workShifts = action.payload;
      })
      .addCase(getWorkShifts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.userMessage;
      })

      // updateWorkShift
      .addCase(updateWorkShift.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(updateWorkShift.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(updateWorkShift.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.userMessage;
      });
  },
});
export const { clearWorkShiftError, getWorkShift } = workShiftSlice.actions;
export default workShiftSlice.reducer;
