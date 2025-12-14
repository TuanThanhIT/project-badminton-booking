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
  AdminUpdateDiscountRequest,
  AdminUpdateDiscountResponse,
} from "../../../types/discount";
import discountService from "../../../services/Admin/discountService";
import discountBookingService from "../../../services/Admin/discountBookingService";

interface DiscountState {
  discounts: AdminDiscountListResponse | undefined;
  discountBookings: AdminDiscountListResponse | undefined;
  message: string | undefined;
  loadingDiscount: boolean;
  loadingDiscountBooking: boolean;
  loadingAdd: boolean;
  error: string | undefined;
}

const initialState: DiscountState = {
  discounts: undefined,
  discountBookings: undefined,
  message: undefined,
  loadingDiscount: false,
  loadingDiscountBooking: false,
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

export const getDiscountBookings = createAsyncThunk<
  AdminDiscountListResponse,
  { data: AdminDiscountRequest },
  { rejectValue: ApiErrorType }
>("discount/getDiscountBookings", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await discountBookingService.getDiscountBookingsService(data);
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

export const addDiscountBooking = createAsyncThunk<
  AdminAddDiscountResponse,
  { data2: AdminAddDiscountRequest },
  { rejectValue: ApiErrorType }
>("discount/addDiscountBooking", async ({ data2 }, { rejectWithValue }) => {
  try {
    const res = await discountBookingService.addDiscountBookingService(data2);
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

export const updateDiscountBookingActive = createAsyncThunk<
  AdminUpdateDiscountResponse,
  { data: AdminUpdateDiscountRequest },
  { rejectValue: ApiErrorType }
>(
  "discount/updateDiscountBookingActive",
  async ({ data }, { rejectWithValue }) => {
    try {
      const res = await discountBookingService.updateDiscountDiscountService(
        data
      );
      return res.data as AdminUpdateDiscountResponse;
    } catch (error) {
      return rejectWithValue(error as ApiErrorType);
    }
  }
);

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

export const deleteDiscountBooking = createAsyncThunk<
  AdminDeleteDiscountResponse,
  { data: AdminDeleteDiscountRequest },
  { rejectValue: ApiErrorType }
>("discount/deleteDiscountBooking", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await discountBookingService.deleteDiscountBookingService(data);
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
    updateDiscountBookingActiveLocal(
      state,
      action: PayloadAction<{ discountId: number }>
    ) {
      const discountBookings = state.discountBookings?.discountBookings;
      const discountId = action.payload.discountId;
      if (!discountBookings) return;

      const index = discountBookings.findIndex((d) => d.id === discountId);
      if (index !== -1) {
        if (!discountBookings[index].isActive) {
          discountBookings[index].isActive = true;
        } else {
          discountBookings[index].isActive = false;
        }
      }
    },
    deleteDiscountBookingLocal(
      state,
      action: PayloadAction<{ discountId: number }>
    ) {
      const discountId = action.payload.discountId;
      if (!state.discountBookings?.discountBookings) return;

      state.discountBookings.discountBookings =
        state.discountBookings.discountBookings.filter(
          (d) => d.id !== discountId
        );
    },
    setDiscountBookingsLocal(
      state,
      action: PayloadAction<{ prevDiscounts: AdminDiscountListResponse }>
    ) {
      state.discountBookings = action.payload.prevDiscounts;
    },
  },
  extraReducers: (builder) => {
    builder
      // getDiscount
      .addCase(getDiscounts.pending, (state) => {
        state.loadingDiscount = true;
        state.error = undefined;
      })
      .addCase(getDiscounts.fulfilled, (state, action) => {
        state.loadingDiscount = false;
        state.discounts = action.payload;
      })
      .addCase(getDiscounts.rejected, (state, action) => {
        state.loadingDiscount = false;
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
      })

      // getDiscountBooking
      .addCase(getDiscountBookings.pending, (state) => {
        state.loadingDiscountBooking = true;
        state.error = undefined;
      })
      .addCase(getDiscountBookings.fulfilled, (state, action) => {
        state.loadingDiscountBooking = false;
        state.discountBookings = action.payload;
      })
      .addCase(getDiscountBookings.rejected, (state, action) => {
        state.loadingDiscountBooking = false;
        state.error = action.payload?.userMessage;
      })

      //addDiscountBooking
      .addCase(addDiscountBooking.pending, (state) => {
        state.loadingAdd = true;
        state.error = undefined;
      })
      .addCase(addDiscountBooking.fulfilled, (state, action) => {
        state.loadingAdd = false;
        state.message = action.payload.message;
      })
      .addCase(addDiscountBooking.rejected, (state, action) => {
        state.loadingAdd = false;
        state.error = action.payload?.userMessage;
      })

      // updateDiscount
      .addCase(updateDiscountBookingActive.fulfilled, (state, action) => {
        state.message = action.payload.message;
      })

      // deleteDiscount
      .addCase(deleteDiscountBooking.fulfilled, (state, action) => {
        state.message = action.payload.message;
      });
  },
});
export const {
  clearDiscountError,
  updateDiscountActiveLocal,
  deleteDiscountLocal,
  setDiscountsLocal,
  updateDiscountBookingActiveLocal,
  deleteDiscountBookingLocal,
  setDiscountBookingsLocal,
} = discountSlice.actions;
export default discountSlice.reducer;
