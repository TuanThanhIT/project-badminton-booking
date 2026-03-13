import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { ApiErrorType } from "../../../types/error";
import type {
  CategoriesGroupedResponse,
  CategoryGroup,
} from "../../../types/cate";
import cateService from "../../../services/user/cateService";

interface AuthState {
  categoriesGroup: CategoryGroup[];
}

const initialState: AuthState = {
  categoriesGroup: [],
};

export const getCategoriesGrouped = createAsyncThunk<
  CategoriesGroupedResponse,
  void,
  { rejectValue: ApiErrorType }
>("cate/getCategoriesGrouped", async (_, { rejectWithValue }) => {
  try {
    const res = await cateService.getCategoriesGroupedByMenuGroupService();
    return res.data as CategoriesGroupedResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

const cateSlice = createSlice({
  name: "cate",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getCategoriesGrouped.fulfilled, (state, action) => {
      state.categoriesGroup = action.payload.data;
    });
  },
});

export default cateSlice.reducer;
