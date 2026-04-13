import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { ApiErrorType } from "../../../types/error";
import type { CourtInfo, CourtInfoResponse } from "../../../types/courtInfo";
import courtService from "../../../services/user/courtService";

interface CourtState {
  courts: CourtInfo[];
}

const initialState: CourtState = {
  courts: [],
};

export const getCourtsByIds = createAsyncThunk<
  CourtInfoResponse,
  { ids: number[] },
  { rejectValue: ApiErrorType }
>("court/getCourtsByIds", async ({ ids }, { rejectWithValue }) => {
  try {
    const res = await courtService.getCourtsByIdsService(ids);
    return res.data as CourtInfoResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const getAllCourts = createAsyncThunk<
  CourtInfoResponse,
  void,
  { rejectValue: ApiErrorType }
>("court/getAllCourts", async (_, { rejectWithValue }) => {
  try {
    const res = await courtService.getAllCourtsService();
    return res.data as CourtInfoResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

const courtSlice = createSlice({
  name: "court",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getCourtsByIds.fulfilled, (state, action) => {
        state.courts = action.payload.data;
      })
      .addCase(getAllCourts.fulfilled, (state, action) => {
        state.courts = action.payload.data;
      });
  },
});

export default courtSlice.reducer;
