import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import managerSalaryService from "../../../services/manager/salaryService";
import type { ApiErrorType } from "../../../types/error";
import type {
  ManagerMonthlySalaryData,
  ManagerSalaryQueries,
} from "../../../types/salary";

///MANAGER
type ManagerSalaryState = {
  loading: boolean;
  data: ManagerMonthlySalaryData | null;
};

///MANAGER
const initialState: ManagerSalaryState = {
  loading: false,
  data: null,
};

///MANAGER
export const getManagerMonthlySalary = createAsyncThunk<
  ManagerMonthlySalaryData,
  ManagerSalaryQueries | undefined,
  { rejectValue: ApiErrorType }
>("managerSalary/getManagerMonthlySalary", async (params = {}, { rejectWithValue }) => {
  try {
    const res = await managerSalaryService.getMonthlySalaryService(params);

    return res.data.data;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

///MANAGER
const salarySlice = createSlice({
  name: "managerSalary",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getManagerMonthlySalary.pending, (state) => {
        state.loading = true;
      })
      .addCase(getManagerMonthlySalary.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(getManagerMonthlySalary.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default salarySlice.reducer;
