import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import managerProductService from "../../../services/manager/productService";
import type { ApiErrorType } from "../../../types/error";
import type {
  ManagerProduct,
  ManagerProductListData,
  ManagerProductQueries,
  ManagerProductStockUpdateData,
  ManagerProductStockUpdateRequest,
} from "../../../types/product";

///MANAGER
type ManagerProductState = {
  loading: boolean;
  products: ManagerProduct[];
  branchId: number | null;
  pagination: ManagerProductListData["pagination"];
};

///MANAGER
const initialState: ManagerProductState = {
  loading: false,
  products: [],
  branchId: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

///MANAGER
export const getManagerProducts = createAsyncThunk<
  ManagerProductListData,
  ManagerProductQueries | undefined,
  { rejectValue: ApiErrorType }
>("managerProduct/getManagerProducts", async (params = {}, { rejectWithValue }) => {
  try {
    const res = await managerProductService.getProductsService(params);

    return res.data.data;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

///MANAGER
export const updateManagerProductStock = createAsyncThunk<
  ManagerProductStockUpdateData,
  ManagerProductStockUpdateRequest,
  { rejectValue: ApiErrorType }
>(
  "managerProduct/updateManagerProductStock",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await managerProductService.updateProductStockService(payload);

      return res.data.data;
    } catch (error) {
      return rejectWithValue(error as ApiErrorType);
    }
  },
);

///MANAGER
const productSlice = createSlice({
  name: "managerProduct",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getManagerProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(getManagerProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.branchId = action.payload.branchId;
        state.pagination = action.payload.pagination;
      })
      .addCase(getManagerProducts.rejected, (state) => {
        state.loading = false;
      })
      .addCase(updateManagerProductStock.fulfilled, (state, action) => {
        const product = state.products.find(
          (item) => item.id === action.payload.productId,
        );

        if (!product) return;

        const variant = product.variants.find(
          (item) => item.id === action.payload.id,
        );

        if (!variant) return;

        variant.stock = action.payload.stock;
        variant.stockId = action.payload.stockId;
        product.totalStock = product.variants.reduce(
          (sum, item) => sum + Number(item.stock || 0),
          0,
        );
      });
  },
});

export default productSlice.reducer;
