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

const normalizeMenuGroup = (menuGroup: string) =>
  menuGroup.trim().replace(/\s+/g, " ").toLocaleLowerCase("vi-VN");

const mergeCategoryGroups = (groups: CategoryGroup[]) => {
  const groupMap = new Map<string, CategoryGroup>();

  groups.forEach((group) => {
    const key = normalizeMenuGroup(group.menuGroup);
    const existingGroup = groupMap.get(key);

    if (!existingGroup) {
      groupMap.set(key, {
        menuGroup: group.menuGroup,
        items: [...group.items],
      });
      return;
    }

    const existingItemIds = new Set(existingGroup.items.map((item) => item.id));
    group.items.forEach((item) => {
      if (!existingItemIds.has(item.id)) {
        existingGroup.items.push(item);
        existingItemIds.add(item.id);
      }
    });
  });

  return Array.from(groupMap.values());
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
        state.categoriesGroup = mergeCategoryGroups(action.payload.data);
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
