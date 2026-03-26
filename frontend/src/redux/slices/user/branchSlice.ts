import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type {
  Branch,
  BranchListResponse,
  Pagination,
  BranchDetail,
  BranchDetailResponse,
  BranchesRequest,
  BranchDetailRequest,
} from "../../../types/branch";
import type { ApiErrorType } from "../../../types/error";
import branchService from "../../../services/user/branchService";
import { data } from "react-router-dom";

interface BranchState {
  branches: Branch[];
  pagination?: Pagination;
  branchDetail?: BranchDetail;
}

const initialState: BranchState = {
  branches: [],
  pagination: undefined,
  branchDetail: undefined,
};

export const getBranches = createAsyncThunk<
  BranchListResponse,
  { data: BranchesRequest },
  { rejectValue: ApiErrorType }
>(
  "branch/getBranches",
  async ({ data }, { rejectWithValue }) => {
    try {
      const res = await branchService.getBranchesService(data);
      return res.data as BranchListResponse;
    } catch (error) {
      return rejectWithValue(error as ApiErrorType);
    }
  },
);
export const getBranchById = createAsyncThunk<
  BranchDetailResponse,
  { data: BranchDetailRequest },
  { rejectValue: ApiErrorType }
>("branch/getBranchById", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await branchService.getBranchByIdService(data);
    return res.data as BranchDetailResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});
const branchSlice = createSlice({
  name: "branch",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getBranches.fulfilled, (state, action) => {
      state.branches = action.payload.data.data;
      state.pagination = action.payload.data.pagination;
    });
    builder.addCase(getBranchById.fulfilled, (state, action) => {
      state.branchDetail = action.payload.data;
    });
  },
});

export default branchSlice.reducer;
