import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import type { ApiErrorType } from "../../../types/error";

import type {
  CreateCourtRequest,
  CreateCourtPriceRequest,
  ManagerCourt,
  CourtPrice,
} from "../../../types/court";

import managerCourtService from "../../../services/manager/courtService";

interface CourtState {
  loading: boolean;
  courts: ManagerCourt[];
  courtPrices: CourtPrice[];
}

const initialState: CourtState = {
  loading: false,
  courts: [],
  courtPrices: [],
};

// CREATE COURT
export const createCourt = createAsyncThunk<
  unknown,
  CreateCourtRequest,
  { rejectValue: ApiErrorType }
>("manager/createCourt", async (data, { rejectWithValue }) => {
  try {
    const res = await managerCourtService.createCourtService(data);

    return res.data;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const createCourtPrice = createAsyncThunk<
  unknown,
  CreateCourtPriceRequest,
  { rejectValue: ApiErrorType }
>("manager/createCourtPrice", async (data, { rejectWithValue }) => {
  try {
    const res = await managerCourtService.createCourtPriceService(data);

    return res.data;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const getCourts = createAsyncThunk<
  ManagerCourt[],
  void,
  { rejectValue: ApiErrorType }
>("manager/getCourts", async (_, { rejectWithValue }) => {
  try {
    const res = await managerCourtService.getCourtsService();

    return res.data.data;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const getCourtPrices = createAsyncThunk<
  CourtPrice[],
  void,
  { rejectValue: ApiErrorType }
>("manager/getCourtPrices", async (_, { rejectWithValue }) => {
  try {
    const res = await managerCourtService.getCourtPricesService();

    return res.data.data;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const updateCourt = createAsyncThunk<
  unknown,
  {
    courtId: number;
    data: CreateCourtRequest;
  },
  { rejectValue: ApiErrorType }
>("manager/updateCourt", async ({ courtId, data }, { rejectWithValue }) => {
  try {
    const res = await managerCourtService.updateCourtService(courtId, data);

    return res.data;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const maintenanceCourt = createAsyncThunk<
  unknown,
  number,
  { rejectValue: ApiErrorType }
>("manager/maintenanceCourt", async (courtId, { rejectWithValue }) => {
  try {
    const res = await managerCourtService.maintenanceCourtService(courtId);

    return res.data;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const closeCourt = createAsyncThunk<
  unknown,
  number,
  { rejectValue: ApiErrorType }
>("manager/closeCourt", async (courtId, { rejectWithValue }) => {
  try {
    const res = await managerCourtService.closeCourtService(courtId);

    return res.data;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

const courtSlice = createSlice({
  name: "managerCourt",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      .addCase(createCourt.pending, (state) => {
        state.loading = true;
      })

      .addCase(createCourt.fulfilled, (state) => {
        state.loading = false;
      })

      .addCase(createCourt.rejected, (state) => {
        state.loading = false;
      })

      .addCase(createCourtPrice.pending, (state) => {
        state.loading = true;
      })

      .addCase(createCourtPrice.fulfilled, (state) => {
        state.loading = false;
      })

      .addCase(createCourtPrice.rejected, (state) => {
        state.loading = false;
      })

      .addCase(getCourts.pending, (state) => {
        state.loading = true;
      })

      .addCase(getCourts.fulfilled, (state, action) => {
        state.loading = false;

        state.courts = action.payload;
      })

      .addCase(getCourts.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getCourtPrices.pending, (state) => {
        state.loading = true;
      })

      .addCase(getCourtPrices.fulfilled, (state, action) => {
        state.loading = false;

        state.courtPrices = action.payload;
      })

      .addCase(getCourtPrices.rejected, (state) => {
        state.loading = false;
      })
      .addCase(updateCourt.pending, (state) => {
        state.loading = true;
      })

      .addCase(updateCourt.fulfilled, (state) => {
        state.loading = false;
      })

      .addCase(updateCourt.rejected, (state) => {
        state.loading = false;
      })

      .addCase(maintenanceCourt.pending, (state) => {
        state.loading = true;
      })

      .addCase(maintenanceCourt.fulfilled, (state) => {
        state.loading = false;
      })

      .addCase(maintenanceCourt.rejected, (state) => {
        state.loading = false;
      })

      .addCase(closeCourt.pending, (state) => {
        state.loading = true;
      })

      .addCase(closeCourt.fulfilled, (state) => {
        state.loading = false;
      })

      .addCase(closeCourt.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default courtSlice.reducer;
