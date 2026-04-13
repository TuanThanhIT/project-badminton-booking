import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type {
  CourtAvailable,
  CourtAvailableResponse,
  GetAvailableCourtsRequest,
  CourtInfo,
  CourtInfoResponse,
} from "../../../types/court";
import type { ApiErrorType } from "../../../types/error";
import courtService from "../../../services/user/courtService";

interface CourtState {
  availableCourts: CourtAvailable[];
  courts: CourtInfo[];
  loading: boolean;
}

const initialState: CourtState = {
  availableCourts: [],
  courts: [],
  loading: false,
};

// 🔥 THUNK 1
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

// 🔥 THUNK 2
export const getCourtsByIds = createAsyncThunk<
  CourtInfoResponse,
  { ids: number[] },
  { rejectValue: ApiErrorType }
>("court/getCourtsByIds", async ({ ids }, { rejectWithValue }) => {
  try {
    const res = await courtService.getCourtsByIdsService(ids);
    return res.data;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

// 🔥 THUNK 3
export const getAllCourts = createAsyncThunk<
  CourtInfoResponse,
  void,
  { rejectValue: ApiErrorType }
>("court/getAllCourts", async (_, { rejectWithValue }) => {
  try {
    const res = await courtService.getAllCourtsService();
    return res.data;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

// ✅ SINGLE SLICE
const courtSlice = createSlice({
  name: "court",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // available courts
      .addCase(getAvailableCourts.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAvailableCourts.fulfilled, (state, action) => {
        state.availableCourts = action.payload.data;
        state.loading = false;
      })
      .addCase(getAvailableCourts.rejected, (state) => {
        state.loading = false;
      })

      // courts by ids
      .addCase(getCourtsByIds.fulfilled, (state, action) => {
        state.courts = action.payload.data;
      })

      // all courts
      .addCase(getAllCourts.fulfilled, (state, action) => {
        state.courts = action.payload.data;
      });
  },
});

export default courtSlice.reducer;
