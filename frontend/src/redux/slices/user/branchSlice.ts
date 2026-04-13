import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type {
  Branch,
  BranchListResponse,
  Pagination,
  BranchDetail,
  BranchDetailResponse,
  BranchesRequest,
  BranchDetailRequest,
  BranchSimple,
  BranchSimpleListResponse,
} from "../../../types/branch";
import type { ApiErrorType } from "../../../types/error";
import branchService from "../../../services/user/branchService";

interface BranchState {
  branches: Branch[];
  pagination?: Pagination;
  branchDetail?: BranchDetail;
  branchSimpleList: BranchSimple[];
}

const initialState: BranchState = {
  branches: [],
  pagination: undefined,
  branchSimpleList: [],
  branchDetail: undefined,
};

// 🔥 1. LIST PAGINATION
export const getBranches = createAsyncThunk<
  BranchListResponse,
  { data: BranchesRequest },
  { rejectValue: ApiErrorType }
>("branch/getBranches", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await branchService.getBranchesService(data);
    return res.data;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

// 🔥 2. DETAIL
export const getBranchById = createAsyncThunk<
  BranchDetailResponse,
  { data: BranchDetailRequest },
  { rejectValue: ApiErrorType }
>("branch/getBranchById", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await branchService.getBranchByIdService(data);
    return res.data;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

// 🔥 3. SIMPLE LIST (dropdown)
export const getAllBranches = createAsyncThunk<
  BranchSimpleListResponse,
  void,
  { rejectValue: ApiErrorType }
>("branch/getAllBranches", async (_, { rejectWithValue }) => {
  try {
    const res = await branchService.getAllBranchesService();
    return res.data;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

// 🔥 4. FULL LIST (nếu cần)
export const getAllBranchesFull = createAsyncThunk<
  BranchListResponse,
  void,
  { rejectValue: ApiErrorType }
>("branch/getAllBranchesFull", async (_, { rejectWithValue }) => {
  try {
    const res = await branchService.getAllBranchService();
    return res.data;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

// ✅ SINGLE SLICE
const branchSlice = createSlice({
  name: "branch",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // pagination
      .addCase(getBranches.fulfilled, (state, action) => {
        state.branches = action.payload.data.data;
        state.pagination = action.payload.data.pagination;
      })

      // detail
      .addCase(getBranchById.fulfilled, (state, action) => {
        state.branchDetail = action.payload.data;
      })

      // simple list
      .addCase(getAllBranches.fulfilled, (state, action) => {
        state.branchSimpleList = action.payload.data;
      })

      // full list
      .addCase(getAllBranchesFull.fulfilled, (state, action) => {
        state.branches = action.payload.data;
      });
  },
});

export default branchSlice.reducer;
