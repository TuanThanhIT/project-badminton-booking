import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { ApiErrorType } from "../../../types/error";
import type {
  CourtScheduleEplRequest,
  CourtScheduleEplResponse,
} from "../../../types/court";
import courtService from "../../../services/employee/courtService";

interface CourtState {
  courtSchedules: CourtScheduleEplResponse;
  message: string | undefined;
  loading: boolean;
  error: string | undefined;
}

const initialState: CourtState = {
  courtSchedules: [],
  message: undefined,
  loading: false,
  error: undefined,
};

export const getCourtSchedules = createAsyncThunk<
  CourtScheduleEplResponse,
  { data: CourtScheduleEplRequest },
  { rejectValue: ApiErrorType }
>("court/getCourtSchedules", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await courtService.getCourtSchedules(data);
    return res.data as CourtScheduleEplResponse;
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
  },
  extraReducers: (builder) => {
    builder
      // getCourtSchedules
      .addCase(getCourtSchedules.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(getCourtSchedules.fulfilled, (state, action) => {
        state.courtSchedules = action.payload;
        state.loading = false;
      })
      .addCase(getCourtSchedules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.userMessage;
      });
  },
});
export const { clearCourtError } = courtSlice.actions;
export default courtSlice.reducer;
