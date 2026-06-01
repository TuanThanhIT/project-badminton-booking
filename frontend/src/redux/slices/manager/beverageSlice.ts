import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import managerBeverageService from "../../../services/manager/beverageService";
import type {
  ManagerBeverage,
  ManagerBeverageListData,
  ManagerBeverageQueries,
  ManagerBeverageStockUpdateData,
  ManagerBeverageStockUpdateRequest,
} from "../../../types/beverage";
import type { ApiErrorType } from "../../../types/error";

///MANAGER
type ManagerBeverageState = {
  loading: boolean;
  beverages: ManagerBeverage[];
  branchId: number | null;
  pagination: ManagerBeverageListData["pagination"];
};

///MANAGER
const initialState: ManagerBeverageState = {
  loading: false,
  beverages: [],
  branchId: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

///MANAGER
export const getManagerBeverages = createAsyncThunk<
  ManagerBeverageListData,
  ManagerBeverageQueries | undefined,
  { rejectValue: ApiErrorType }
>(
  "managerBeverage/getManagerBeverages",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await managerBeverageService.getBeveragesService(params);

      return res.data.data;
    } catch (error) {
      return rejectWithValue(error as ApiErrorType);
    }
  },
);

///MANAGER
export const updateManagerBeverageStock = createAsyncThunk<
  ManagerBeverageStockUpdateData,
  ManagerBeverageStockUpdateRequest,
  { rejectValue: ApiErrorType }
>(
  "managerBeverage/updateManagerBeverageStock",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await managerBeverageService.updateBeverageStockService(
        payload,
      );

      return res.data.data;
    } catch (error) {
      return rejectWithValue(error as ApiErrorType);
    }
  },
);

///MANAGER
const beverageSlice = createSlice({
  name: "managerBeverage",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getManagerBeverages.pending, (state) => {
        state.loading = true;
      })
      .addCase(getManagerBeverages.fulfilled, (state, action) => {
        state.loading = false;
        state.beverages = action.payload.beverages;
        state.branchId = action.payload.branchId;
        state.pagination = action.payload.pagination;
      })
      .addCase(getManagerBeverages.rejected, (state) => {
        state.loading = false;
      })
      .addCase(updateManagerBeverageStock.fulfilled, (state, action) => {
        const beverage = state.beverages.find(
          (item) => item.id === action.payload.id,
        );

        if (!beverage) return;

        beverage.stock = action.payload.stock;
        beverage.stockId = action.payload.stockId;
      });
  },
});

export default beverageSlice.reducer;
