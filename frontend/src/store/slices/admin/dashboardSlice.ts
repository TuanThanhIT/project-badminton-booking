import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { ApiErrorType } from "../../../types/error";
import type {
  DashboardBookingResponse,
  DashboardLowStockResponse,
  DashboardRetailOrderResponse,
  DashboardRevenue7DaysResponse,
  DashboardTopBeveragesResponse,
  DashboardTopProductsResponse,
  DashboardWorkShiftResponse,
} from "../../../types/dashboard";
import dashboardService from "../../../services/admin/dashboardService";

interface DashboardState {
  dashboardRevenue: DashboardRevenue7DaysResponse;
  dashboardRetailOrder: DashboardRetailOrderResponse | undefined;
  dashboardTopBeverages: DashboardTopBeveragesResponse | undefined;
  dashboardTopProducts: DashboardTopProductsResponse | undefined;
  dashboardLowStock: DashboardLowStockResponse | undefined;
  dashboardBookingToday: DashboardBookingResponse | undefined;
  dashboardWorkShift: DashboardWorkShiftResponse;
  loading: boolean;
  error: string | undefined;
}

const initialState: DashboardState = {
  dashboardRevenue: [],
  dashboardRetailOrder: undefined,
  dashboardTopBeverages: undefined,
  dashboardTopProducts: undefined,
  dashboardLowStock: undefined,
  dashboardBookingToday: undefined,
  dashboardWorkShift: [],
  loading: false,
  error: undefined,
};

export const getDashboardRevenue = createAsyncThunk<
  DashboardRevenue7DaysResponse,
  void,
  { rejectValue: ApiErrorType }
>("dashboard/getDashboardRevenue", async (_, { rejectWithValue }) => {
  try {
    const res = await dashboardService.getDashboardRevenue7DaysService();
    return res.data as DashboardRevenue7DaysResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const getDashboardRetailOrder = createAsyncThunk<
  DashboardRetailOrderResponse,
  void,
  { rejectValue: ApiErrorType }
>("dashboard/getDashboardRetailOrder", async (_, { rejectWithValue }) => {
  try {
    const res = await dashboardService.getDashboardRetailOrderService();
    return res.data as DashboardRetailOrderResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const getDashboardTopBeverages = createAsyncThunk<
  DashboardTopBeveragesResponse,
  void,
  { rejectValue: ApiErrorType }
>("dashboard/getDashboardTopBeverages", async (_, { rejectWithValue }) => {
  try {
    const res = await dashboardService.getTopBeveragesService();
    return res.data as DashboardTopBeveragesResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const getDashboardTopProducts = createAsyncThunk<
  DashboardTopProductsResponse,
  void,
  { rejectValue: ApiErrorType }
>("dashboard/getDashboardTopProducts", async (_, { rejectWithValue }) => {
  try {
    const res = await dashboardService.getTopProductsService();
    return res.data as DashboardTopProductsResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const getDashboardLowStock = createAsyncThunk<
  DashboardLowStockResponse,
  void,
  { rejectValue: ApiErrorType }
>("dashboard/getDashboardLowStock", async (_, { rejectWithValue }) => {
  try {
    const res = await dashboardService.getLowStockService();
    return res.data as DashboardLowStockResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const getDashboardBookingToday = createAsyncThunk<
  DashboardBookingResponse,
  void,
  { rejectValue: ApiErrorType }
>("dashboard/getDashboardBookingToday", async (_, { rejectWithValue }) => {
  try {
    const res = await dashboardService.getDashboardBookingService();
    return res.data as DashboardBookingResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const getDashboardWorkShift = createAsyncThunk<
  DashboardWorkShiftResponse,
  void,
  { rejectValue: ApiErrorType }
>("dashboard/getDashboardWorkShift", async (_, { rejectWithValue }) => {
  try {
    const res = await dashboardService.getWorkShiftService();
    return res.data as DashboardWorkShiftResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearDashboardError(state) {
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getDashboardRevenue.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(getDashboardRevenue.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardRevenue = action.payload;
      })
      .addCase(getDashboardRevenue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.userMessage;
      })

      .addCase(getDashboardRetailOrder.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(getDashboardRetailOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardRetailOrder = action.payload;
      })
      .addCase(getDashboardRetailOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.userMessage;
      })

      .addCase(getDashboardBookingToday.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(getDashboardBookingToday.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardBookingToday = action.payload;
      })
      .addCase(getDashboardBookingToday.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.userMessage;
      })

      .addCase(getDashboardTopProducts.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(getDashboardTopProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardTopProducts = action.payload;
      })
      .addCase(getDashboardTopProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.userMessage;
      })

      .addCase(getDashboardTopBeverages.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(getDashboardTopBeverages.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardTopBeverages = action.payload;
      })
      .addCase(getDashboardTopBeverages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.userMessage;
      })

      .addCase(getDashboardLowStock.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(getDashboardLowStock.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardLowStock = action.payload;
      })
      .addCase(getDashboardLowStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.userMessage;
      })

      .addCase(getDashboardWorkShift.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(getDashboardWorkShift.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardWorkShift = action.payload;
      })
      .addCase(getDashboardWorkShift.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.userMessage;
      });
  },
});
export const { clearDashboardError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
