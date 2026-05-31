import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import managerRevenueService from "../../../services/manager/revenueService";
import type { ApiErrorType } from "../../../types/error";
import type {
  ManagerRevenueData,
  ManagerRevenueQueries,
} from "../../../types/revenue";

///MANAGER
type ManagerRevenueState = {
  loading: boolean;
  data: ManagerRevenueData | null;
};

///MANAGER
const initialState: ManagerRevenueState = {
  loading: false,
  data: null,
};

///MANAGER
export const getManagerRevenue = createAsyncThunk<
  ManagerRevenueData,
  ManagerRevenueQueries | undefined,
  { rejectValue: ApiErrorType }
>("managerRevenue/getManagerRevenue", async (params = {}, { rejectWithValue }) => {
  try {
    const res = await managerRevenueService.getRevenueService(params);

    return res.data.data;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

///MANAGER
const revenueSlice = createSlice({
  name: "managerRevenue",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getManagerRevenue.pending, (state) => {
        state.loading = true;
      })
      .addCase(getManagerRevenue.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(getManagerRevenue.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default revenueSlice.reducer;
