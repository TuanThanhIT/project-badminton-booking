import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { ApiErrorType } from "../../../types/error";
import type {
  CheckoutCounterDraftRequest,
  CounterBeverage,
  CounterCourtBoard,
  CounterDraft,
  CounterDraftResponse,
  CounterProduct,
  CounterSession,
  UpdateCounterDraftRequest,
} from "../../../types/employeeCounter";
import counterService from "../../../services/employee/counterService";

type CounterState = {
  session: CounterSession | null;
  products: CounterProduct[];
  beverages: CounterBeverage[];
  courtBoard: CounterCourtBoard | null;
  drafts: CounterDraft[];
};

const initialState: CounterState = {
  session: null,
  products: [],
  beverages: [],
  courtBoard: null,
  drafts: [],
};

export const getCounterSession = createAsyncThunk<
  CounterSession,
  void,
  { rejectValue: ApiErrorType }
>("employeeCounter/getCounterSession", async (_, { rejectWithValue }) => {
  try {
    const res = await counterService.getSessionService();
    return res.data.data;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const getCounterProducts = createAsyncThunk<
  CounterProduct[],
  { keyword?: string },
  { rejectValue: ApiErrorType }
>("employeeCounter/getCounterProducts", async ({ keyword = "" }, { rejectWithValue }) => {
  try {
    const res = await counterService.getProductsService(keyword);
    return res.data.data;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const getCounterBeverages = createAsyncThunk<
  CounterBeverage[],
  { keyword?: string },
  { rejectValue: ApiErrorType }
>("employeeCounter/getCounterBeverages", async ({ keyword = "" }, { rejectWithValue }) => {
  try {
    const res = await counterService.getBeveragesService(keyword);
    return res.data.data;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const getCounterCourtBoard = createAsyncThunk<
  CounterCourtBoard,
  { date: string },
  { rejectValue: ApiErrorType }
>("employeeCounter/getCounterCourtBoard", async ({ date }, { rejectWithValue }) => {
  try {
    const res = await counterService.getCourtBoardService(date);
    return res.data.data;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const getCounterDrafts = createAsyncThunk<
  CounterDraft[],
  void,
  { rejectValue: ApiErrorType }
>("employeeCounter/getCounterDrafts", async (_, { rejectWithValue }) => {
  try {
    const res = await counterService.getDraftsService();
    return res.data.data;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const createCounterDraft = createAsyncThunk<
  CounterDraftResponse,
  { nameCustomer: string; phoneNumber: string },
  { rejectValue: ApiErrorType }
>("employeeCounter/createCounterDraft", async ({ nameCustomer, phoneNumber }, { rejectWithValue }) => {
  try {
    const res = await counterService.createDraftService(nameCustomer, phoneNumber);
    return res.data;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const updateCounterDraft = createAsyncThunk<
  CounterDraftResponse,
  { draftId: number; data: UpdateCounterDraftRequest },
  { rejectValue: ApiErrorType }
>("employeeCounter/updateCounterDraft", async ({ draftId, data }, { rejectWithValue }) => {
  try {
    const res = await counterService.updateDraftService(draftId, data);
    return res.data;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const deleteCounterDraft = createAsyncThunk<
  number,
  { draftId: number },
  { rejectValue: ApiErrorType }
>("employeeCounter/deleteCounterDraft", async ({ draftId }, { rejectWithValue }) => {
  try {
    await counterService.deleteDraftService(draftId);
    return draftId;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const checkoutCounterDraft = createAsyncThunk<
  CounterDraftResponse,
  { draftId: number; data: CheckoutCounterDraftRequest },
  { rejectValue: ApiErrorType }
>("employeeCounter/checkoutCounterDraft", async ({ draftId, data }, { rejectWithValue }) => {
  try {
    const res = await counterService.checkoutDraftService(draftId, data);
    return res.data;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

const upsertDraft = (drafts: CounterDraft[], draft: CounterDraft) => {
  const exists = drafts.some((item) => item.id === draft.id);
  if (!exists) return [draft, ...drafts];
  return drafts.map((item) => (item.id === draft.id ? draft : item));
};

const counterSlice = createSlice({
  name: "employeeCounter",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getCounterSession.fulfilled, (state, action) => {
        state.session = action.payload;
      })
      .addCase(getCounterProducts.fulfilled, (state, action) => {
        state.products = action.payload;
      })
      .addCase(getCounterBeverages.fulfilled, (state, action) => {
        state.beverages = action.payload;
      })
      .addCase(getCounterCourtBoard.fulfilled, (state, action) => {
        state.courtBoard = action.payload;
      })
      .addCase(getCounterDrafts.fulfilled, (state, action) => {
        state.drafts = action.payload;
      })
      .addCase(createCounterDraft.fulfilled, (state, action) => {
        state.drafts = upsertDraft(state.drafts, action.payload.data);
      })
      .addCase(updateCounterDraft.fulfilled, (state, action) => {
        state.drafts = upsertDraft(state.drafts, action.payload.data);
      })
      .addCase(deleteCounterDraft.fulfilled, (state, action) => {
        state.drafts = state.drafts.filter((item) => item.id !== action.payload);
      })
      .addCase(checkoutCounterDraft.fulfilled, (state, action) => {
        state.drafts = state.drafts.filter(
          (item) => item.id !== action.payload.data.id,
        );
      });
  },
});

export default counterSlice.reducer;
