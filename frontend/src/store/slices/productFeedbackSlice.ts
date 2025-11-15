import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { ApiErrorType } from "../../types/error";
import type {
  AddOrUpdateFeedbackRequest,
  AddOrUpdateFeedbackResponse,
  ProductFeedbackDetailRequest,
  ProductFeedBackDetailResponse,
  ProductFeedbackRequest,
  ProductFeedbackResponse,
} from "../../types/productFeedback";
import productFeedbackService from "../../services/productFeedbackService";

interface ProductFeedbackState {
  productFeedbackDetail: ProductFeedBackDetailResponse | undefined;
  productFeedbacks: ProductFeedbackResponse;
  message: string | undefined;
  loading: boolean;
  error: string | undefined;
}

const initialState: ProductFeedbackState = {
  productFeedbackDetail: undefined,
  productFeedbacks: [],
  message: undefined,
  loading: false,
  error: undefined,
};

export const addProductFeedback = createAsyncThunk<
  AddOrUpdateFeedbackResponse,
  { data: AddOrUpdateFeedbackRequest },
  { rejectValue: ApiErrorType }
>(
  "productFeedback/addProductFeedback",
  async ({ data }, { rejectWithValue }) => {
    try {
      const res = await productFeedbackService.createProductFeedbackService(
        data
      );
      return res.data as AddOrUpdateFeedbackResponse;
    } catch (error) {
      return rejectWithValue(error as ApiErrorType);
    }
  }
);

export const updateProductFeedback = createAsyncThunk<
  AddOrUpdateFeedbackResponse,
  { data: AddOrUpdateFeedbackRequest },
  { rejectValue: ApiErrorType }
>(
  "productFeedback/updateProductFeedback",
  async ({ data }, { rejectWithValue }) => {
    try {
      const res = await productFeedbackService.updateProductFeedbackService(
        data
      );
      return res.data as AddOrUpdateFeedbackResponse;
    } catch (error) {
      return rejectWithValue(error as ApiErrorType);
    }
  }
);

export const getProductFeedbackDetail = createAsyncThunk<
  ProductFeedBackDetailResponse,
  { data: ProductFeedbackDetailRequest },
  { rejectValue: ApiErrorType }
>(
  "productFeedback/getProductFeedbackDetail",
  async ({ data }, { rejectWithValue }) => {
    try {
      const res = await productFeedbackService.getProductFeedbackDetailService(
        data
      );
      return res.data as ProductFeedBackDetailResponse;
    } catch (error) {
      return rejectWithValue(error as ApiErrorType);
    }
  }
);

export const getProductFeedback = createAsyncThunk<
  ProductFeedbackResponse,
  { data: ProductFeedbackRequest },
  { rejectValue: ApiErrorType }
>(
  "/productFeedback/getProductFeedback",
  async ({ data }, { rejectWithValue }) => {
    try {
      const res = await productFeedbackService.getProductFeedbackService(data);
      return res.data as ProductFeedbackResponse;
    } catch (error) {
      return rejectWithValue(error as ApiErrorType);
    }
  }
);

const productFeedbackSlice = createSlice({
  name: "productFeedback",
  initialState,
  reducers: {
    clearProductFeedbackError(state) {
      state.error = undefined;
    },
    clearProductFeedbackDetail(state) {
      state.productFeedbackDetail = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      // addProductFeedback
      .addCase(addProductFeedback.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(addProductFeedback.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(addProductFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.userMessage;
      })

      //getProductFeedbackDetail
      .addCase(getProductFeedbackDetail.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(getProductFeedbackDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.productFeedbackDetail = action.payload;
      })
      .addCase(getProductFeedbackDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.userMessage;
      })

      // updateProductFeedback
      .addCase(updateProductFeedback.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(updateProductFeedback.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(updateProductFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.userMessage;
      })

      // getProductFeedback
      .addCase(getProductFeedback.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(getProductFeedback.fulfilled, (state, action) => {
        state.loading = false;
        state.productFeedbacks = action.payload;
      })
      .addCase(getProductFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.userMessage;
      });
  },
});
export const { clearProductFeedbackError, clearProductFeedbackDetail } =
  productFeedbackSlice.actions;
export default productFeedbackSlice.reducer;
