import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { ApiErrorType } from "../../../types/error";
import type {
  ProductEplRequest,
  ProductEplResponse,
} from "../../../types/product";
import productService from "../../../services/employee/productService";

interface ProductState {
  products: ProductEplResponse;
  message: string | undefined;
  loading: boolean;
  error: string | undefined;
}

const initialState: ProductState = {
  products: [],
  message: undefined,
  loading: false,
  error: undefined,
};

export const getProducts = createAsyncThunk<
  ProductEplResponse,
  { dt: ProductEplRequest },
  { rejectValue: ApiErrorType }
>("product/getProducts", async ({ dt }, { rejectWithValue }) => {
  try {
    const res = await productService.getProducts(dt);
    return res.data as ProductEplResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    clearProductError(state) {
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      // getCourtSchedules
      .addCase(getProducts.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.products = action.payload;
        state.loading = false;
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.userMessage;
      });
  },
});
export const { clearProductError } = productSlice.actions;
export default productSlice.reducer;
