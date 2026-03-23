import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { ApiErrorType } from "../../../types/error";
import type { Branch, BranchResponse } from "../../../types/branch";
import branchService from "../../../services/user/branchService";

interface BranchState {
  branches: Branch[];
}

const initialState: BranchState = {
  branches: [],
};

export const getAllBranch = createAsyncThunk<
  BranchResponse,
  void,
  { rejectValue: ApiErrorType }
>("branch/getAllBranch", async (_, { rejectWithValue }) => {
  try {
    const res = await branchService.getAllBranchService();
    return res.data as BranchResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

const branchSlice = createSlice({
  name: "branch",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getAllBranch.fulfilled, (state, action) => {
      state.branches = action.payload.data;
    });
  },
});

export default branchSlice.reducer;
