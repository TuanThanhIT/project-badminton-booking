import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { ApiErrorType } from "../../../types/error";
import type {
  BeverageEplRequest,
  BeverageEplResponse,
} from "../../../types/beverage";
import beverageService from "../../../services/employee/beverageService";

interface BeverageState {
  beverages: BeverageEplResponse;
  message: string | undefined;
  loading: boolean;
  error: string | undefined;
}

const initialState: BeverageState = {
  beverages: [],
  message: undefined,
  loading: false,
  error: undefined,
};

export const getBeverages = createAsyncThunk<
  BeverageEplResponse,
  { dta: BeverageEplRequest },
  { rejectValue: ApiErrorType }
>("beverage/getBeverages", async ({ dta }, { rejectWithValue }) => {
  try {
    const res = await beverageService.getBeverages(dta);
    return res.data as BeverageEplResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

const beverageSlice = createSlice({
  name: "beverage",
  initialState,
  reducers: {
    clearBeverageError(state) {
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      // getCourtSchedules
      .addCase(getBeverages.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(getBeverages.fulfilled, (state, action) => {
        state.beverages = action.payload;
        state.loading = false;
      })
      .addCase(getBeverages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.userMessage;
      });
  },
});
export const { clearBeverageError } = beverageSlice.actions;
export default beverageSlice.reducer;
