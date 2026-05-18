import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { ApiErrorType } from "../../../types/error";
import type {
  CategoriesGroupedResponse,
  CategoriesByGroupRequest,
  Category,
  CategoryGroup,
  OtherCategoriesResponse,
  OtherCatesParamsRequest,
} from "../../../types/cate";
import cateService from "../../../services/user/cateService";

interface CateState {
  categoriesGroup: CategoryGroup[];
  otherCategories: Category[];
}

const initialState: CateState = {
  categoriesGroup: [],
  otherCategories: [],
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

export const getOtherCategoriesInSameGroup = createAsyncThunk<
  OtherCategoriesResponse,
  { data: OtherCatesParamsRequest },
  { rejectValue: ApiErrorType }
>(
  "cate/getOtherCategoriesInSameGroup",
  async ({ data }, { rejectWithValue }) => {
    try {
      const res = await cateService.getOtherCategoriesInSameGroupService(data);
      return res.data as OtherCategoriesResponse;
    } catch (error) {
      return rejectWithValue(error as ApiErrorType);
    }
  },
);

export const getCategoriesByGroup = createAsyncThunk<
  OtherCategoriesResponse,
  { data: CategoriesByGroupRequest },
  { rejectValue: ApiErrorType }
>("cate/getCategoriesByGroup", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await cateService.getCategoriesByGroupService(data);
    return res.data as OtherCategoriesResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

const cateSlice = createSlice({
  name: "cate",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getCategoriesGrouped.fulfilled, (state, action) => {
        state.categoriesGroup = action.payload.data;
      })

      .addCase(getOtherCategoriesInSameGroup.fulfilled, (state, action) => {
        state.otherCategories = action.payload.data;
      })

      .addCase(getCategoriesByGroup.fulfilled, (state, action) => {
        state.otherCategories = action.payload.data;
      });
  },
});

export default cateSlice.reducer;
