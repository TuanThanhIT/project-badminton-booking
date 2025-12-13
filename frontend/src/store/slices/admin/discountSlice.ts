import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { ApiErrorType } from "../../../types/error";
import type {
  AdminAddDiscountRequest,
  AdminAddDiscountResponse,
  AdminDeleteDiscountRequest,
  AdminDeleteDiscountResponse,
  AdminDiscountListResponse,
  AdminDiscountRequest,
  AdminDiscountResponse,
  AdminUpdateDiscountRequest,
  AdminUpdateDiscountResponse,
} from "../../../types/discount";
import discountService from "../../../services/Admin/discountService";

interface DiscountState {
  discounts: AdminDiscountListResponse | undefined;
  message: string | undefined;
  loading: boolean;
  loadingAdd: boolean;
  error: string | undefined;
}

const initialState: DiscountState = {
  discounts: undefined,
  message: undefined,
  loading: false,
  loadingAdd: false,
  error: undefined,
};

export const getDiscounts = createAsyncThunk<
  AdminDiscountListResponse,
  { data: AdminDiscountRequest },
  { rejectValue: ApiErrorType }
>("discount/getDiscounts", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await discountService.getDiscountsService(data);
    return res.data as AdminDiscountListResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const addDiscount = createAsyncThunk<
  AdminAddDiscountResponse,
  { data2: AdminAddDiscountRequest },
  { rejectValue: ApiErrorType }
>("discount/addDiscount", async ({ data2 }, { rejectWithValue }) => {
  try {
    const res = await discountService.addDiscountService(data2);
    return res.data as AdminAddDiscountResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const updateDiscountActive = createAsyncThunk<
  AdminUpdateDiscountResponse,
  { data: AdminUpdateDiscountRequest },
  { rejectValue: ApiErrorType }
>("discount/updateDiscountActive", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await discountService.updateDiscountService(data);
    return res.data as AdminUpdateDiscountResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const deleteDiscount = createAsyncThunk<
  AdminDeleteDiscountResponse,
  { data: AdminDeleteDiscountRequest },
  { rejectValue: ApiErrorType }
>("discount/deleteDiscount", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await discountService.deleteDiscountService(data);
    return res.data as AdminDeleteDiscountResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

const discountSlice = createSlice({
  name: "discount",
  initialState,
  reducers: {
    clearDiscountError(state) {
      state.error = undefined;
    },
    updateDiscountActiveLocal(
      state,
      action: PayloadAction<{ discountId: number }>
    ) {
      const discounts = state.discounts?.discounts;
      const discountId = action.payload.discountId;
      if (!discounts) return;

      const index = discounts.findIndex((d) => d.id === discountId);
      if (index !== -1) {
        if (!discounts[index].isActive) {
          discounts[index].isActive = true;
        } else {
          discounts[index].isActive = false;
        }
      }
    },
    deleteDiscountLocal(state, action: PayloadAction<{ discountId: number }>) {
      const discountId = action.payload.discountId;
      if (!state.discounts?.discounts) return;

      state.discounts.discounts = state.discounts.discounts.filter(
        (d) => d.id !== discountId
      );
    },
    setDiscountsLocal(
      state,
      action: PayloadAction<{ prevDiscounts: AdminDiscountListResponse }>
    ) {
      state.discounts = action.payload.prevDiscounts;
    },
  },
  extraReducers: (builder) => {
    builder
      // getDiscount
      .addCase(getDiscounts.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(getDiscounts.fulfilled, (state, action) => {
        state.loading = false;
        state.discounts = action.payload;
      })
      .addCase(getDiscounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.userMessage;
      })

      //addDiscount
      .addCase(addDiscount.pending, (state) => {
        state.loadingAdd = true;
        state.error = undefined;
      })
      .addCase(addDiscount.fulfilled, (state, action) => {
        state.loadingAdd = false;
        state.message = action.payload.message;
      })
      .addCase(addDiscount.rejected, (state, action) => {
        state.loadingAdd = false;
        state.error = action.payload?.userMessage;
      })

      // updateDiscount
      .addCase(updateDiscountActive.fulfilled, (state, action) => {
        state.message = action.payload.message;
      })

      // deleteDiscount
      .addCase(deleteDiscount.fulfilled, (state, action) => {
        state.message = action.payload.message;
      });
  },
});
export const {
  clearDiscountError,
  updateDiscountActiveLocal,
  deleteDiscountLocal,
  setDiscountsLocal,
} = discountSlice.actions;
export default discountSlice.reducer;
