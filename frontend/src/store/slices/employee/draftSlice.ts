import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { ApiErrorType } from "../../../types/error";
import type {
  AddDraftBookingRequest,
  AddDraftBookingResponse,
  DraftBookingListResponse,
  DraftBookingRequest,
  DraftBookingResponse,
  UpdateDraftBookingRequest,
  UpdateDraftBookingResponse,
} from "../../../types/draft";
import draftService from "../../../services/employee/draftService";

interface DraftState {
  draftBookings: DraftBookingListResponse;
  draftBooking: DraftBookingResponse | undefined;
  message: string | undefined;
  loading: boolean;
  error: string | undefined;
}

const initialState: DraftState = {
  draftBookings: [],
  draftBooking: undefined,
  message: undefined,
  loading: false,
  error: undefined,
};

export const getDrafts = createAsyncThunk<
  DraftBookingListResponse,
  void,
  { rejectValue: ApiErrorType }
>("draft/getDrafts", async (_, { rejectWithValue }) => {
  try {
    const res = await draftService.getDraftsService();
    return res.data as DraftBookingListResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const getDraft = createAsyncThunk<
  DraftBookingResponse,
  { data: DraftBookingRequest },
  { rejectValue: ApiErrorType }
>("draft/getDraft", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await draftService.getDraftService(data);
    return res.data as DraftBookingResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const createDraft = createAsyncThunk<
  AddDraftBookingResponse,
  { data: AddDraftBookingRequest },
  { rejectValue: ApiErrorType }
>("draft/createDraft", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await draftService.createDraftService(data);
    return res.data as AddDraftBookingResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const createAndUpdateDraft = createAsyncThunk<
  UpdateDraftBookingResponse,
  { data: UpdateDraftBookingRequest },
  { rejectValue: ApiErrorType }
>("draft/createAndUpdateDraft", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await draftService.createAndUpdateDraftService(data);
    return res.data as UpdateDraftBookingResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

const draftSlice = createSlice({
  name: "draft",
  initialState,
  reducers: {
    clearDraftError(state) {
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      // getCourtSchedules
      .addCase(getDrafts.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(getDrafts.fulfilled, (state, action) => {
        state.draftBookings = action.payload;
        state.loading = false;
      })
      .addCase(getDrafts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.userMessage;
      })

      // CreateDraft
      .addCase(createDraft.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(createDraft.fulfilled, (state, action) => {
        state.message = action.payload.message;
        state.loading = false;
      })
      .addCase(createDraft.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.userMessage;
      })

      // CreateAndUpdateDraft
      .addCase(createAndUpdateDraft.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(createAndUpdateDraft.fulfilled, (state, action) => {
        state.message = action.payload.message;
        state.loading = false;
      })
      .addCase(createAndUpdateDraft.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.userMessage;
      })

      // getDraft
      .addCase(getDraft.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(getDraft.fulfilled, (state, action) => {
        state.draftBooking = action.payload;
        state.loading = false;
      })
      .addCase(getDraft.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.userMessage;
      });
  },
});
export const { clearDraftError } = draftSlice.actions;
export default draftSlice.reducer;
