// redux/slices/user/courtSlice.ts

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type {
  CourtAvailable,
  CourtAvailableResponse,
  GetAvailableCourtsRequest,
} from "../../../types/court";
import type { ApiErrorType } from "../../../types/error";
import courtService from "../../../services/user/courtService";

interface CourtState {
  availableCourts: CourtAvailable[];
  loading: boolean;
}

const initialState: CourtState = {
  availableCourts: [],
  loading: false,
};

// 🔥 THUNK
export const getAvailableCourts = createAsyncThunk<
  CourtAvailableResponse,
  GetAvailableCourtsRequest,
  { rejectValue: ApiErrorType }
>("court/getAvailableCourts", async (params, { rejectWithValue }) => {
  try {
    const res = await courtService.getAvailableCourtsService(params);
    return res.data;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});
const courtSlice = createSlice({
  name: "court",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getAvailableCourts.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(getAvailableCourts.fulfilled, (state, action) => {
      state.availableCourts = action.payload.data;
      state.loading = false;
    });

    builder.addCase(getAvailableCourts.rejected, (state) => {
      state.loading = false;
    });
  },
});

export default courtSlice.reducer;
