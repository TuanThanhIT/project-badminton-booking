import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { ApiErrorType } from "../../../types/error";
import type {
  ProductDetail,
  ProductDetailRequest,
  ProductDetailResponse,
  ProductFilterData,
  ProductFilterResponse,
  ProductQueriesRequest,
} from "../../../types/product";
import productService from "../../../services/user/productService";

interface ProductState {
  products?: ProductFilterData;
  productDetail?: ProductDetail;
}

const initialState: ProductState = {
  products: undefined,
  productDetail: undefined,
};

export const getProductsByFilter = createAsyncThunk<
  ProductFilterResponse,
  { data: ProductQueriesRequest },
  { rejectValue: ApiErrorType }
>("product/getProductsByFilter", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await productService.getProductsByFilterService(data);
    return res.data as ProductFilterResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const getProductDetail = createAsyncThunk<
  ProductDetailResponse,
  { data: ProductDetailRequest },
  { rejectValue: ApiErrorType }
>("product/getProductDetail", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await productService.getProductDetailService(data);
    return res.data as ProductDetailResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getProductsByFilter.fulfilled, (state, action) => {
        state.products = action.payload.data;
      })

      .addCase(getProductDetail.fulfilled, (state, action) => {
        state.productDetail = action.payload.data;
      });
  },
});

export default productSlice.reducer;
