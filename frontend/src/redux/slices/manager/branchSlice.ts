import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import type { ApiErrorType } from "../../../types/error";

import type { ManagerBranch } from "../../../types/branch";

import managerBranchService from "../../../services/manager/branchService";

interface BranchState {
  loading: boolean;

  branch: ManagerBranch | null;
}

const initialState: BranchState = {
  loading: false,

  branch: null,
};

// GET MY BRANCH
export const getMyBranch = createAsyncThunk<
  ManagerBranch,
  void,
  { rejectValue: ApiErrorType }
>("manager/getMyBranch", async (_, { rejectWithValue }) => {
  try {
    const res = await managerBranchService.getMyBranchService();

    return res.data.data;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

const branchSlice = createSlice({
  name: "managerBranch",

  initialState,

  reducers: {},

  extraReducers: (builder) => {
    builder

      .addCase(getMyBranch.pending, (state) => {
        state.loading = true;
      })

      .addCase(getMyBranch.fulfilled, (state, action) => {
        state.loading = false;

        state.branch = action.payload;
      })

      .addCase(getMyBranch.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default branchSlice.reducer;
