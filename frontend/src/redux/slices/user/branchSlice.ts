import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import type { ApiErrorType } from "../../../types/error";
import branchService from "../../../services/user/branchService";
import type {
  BranchDetail,
  BranchDetailRequest,
  BranchDetailResponse,
  BranchesRequest,
  BranchListData,
  BranchListItem,
  BranchListItemResponse,
  BranchListResponse,
  BranchOptions,
  BranchOptionsListResponse,
} from "../../../types/branch";

interface BranchState {
  pagedBranch?: BranchListData;
  branchOptions: BranchOptions[];
  branchDetail?: BranchDetail;
  branches: BranchListItem[];
}

const initialState: BranchState = {
  pagedBranch: undefined,
  branchOptions: [],
  branchDetail: undefined,
  branches: [],
};

export const getPagedBranches = createAsyncThunk<
  BranchListResponse,
  { data: BranchesRequest },
  { rejectValue: ApiErrorType }
>("branch/getPageBranches", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await branchService.getPagedBranchesService(data);
    return res.data as BranchListResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const getBranchDetail = createAsyncThunk<
  BranchDetailResponse,
  { data: BranchDetailRequest },
  { rejectValue: ApiErrorType }
>("branch/getBranchById", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await branchService.getBranchDetailService(data);
    return res.data as BranchDetailResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const getBranchOptions = createAsyncThunk<
  BranchOptionsListResponse,
  void,
  { rejectValue: ApiErrorType }
>("branch/getBranchOptions", async (_, { rejectWithValue }) => {
  try {
    const res = await branchService.getBranchOptionsService();
    return res.data as BranchOptionsListResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const getAllBranches = createAsyncThunk<
  BranchListItemResponse,
  void,
  { rejectValue: ApiErrorType }
>("branch/getAllBranches", async (_, { rejectWithValue }) => {
  try {
    const res = await branchService.getAllBranchesService();
    return res.data as BranchListItemResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

const branchSlice = createSlice({
  name: "branch",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getPagedBranches.fulfilled, (state, action) => {
        state.pagedBranch = action.payload.data;
      })

      .addCase(getBranchDetail.fulfilled, (state, action) => {
        state.branchDetail = action.payload.data;
      })

      .addCase(getBranchOptions.fulfilled, (state, action) => {
        state.branchOptions = action.payload.data;
      })

      .addCase(getAllBranches.fulfilled, (state, action) => {
        state.branches = action.payload.data;
      });
  },
});

export default branchSlice.reducer;
