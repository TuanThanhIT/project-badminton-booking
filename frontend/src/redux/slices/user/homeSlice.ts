import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { ApiErrorType } from "../../../types/error";
import type { HomeData, HomeDataResponse } from "../../../types/home";
import homeService from "../../../services/user/homeService";

interface HomeState {
  homeData?: HomeData;
}

const initialState: HomeState = {
  homeData: undefined,
};

export const getHomeData = createAsyncThunk<
  HomeDataResponse,
  void,
  { rejectValue: ApiErrorType }
>("home/getHomeData", async (_, { rejectWithValue }) => {
  try {
    const res = await homeService.getHomeDataService();
    return res.data as HomeDataResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

const homeSlice = createSlice({
  name: "home",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getHomeData.fulfilled, (state, action) => {
      state.homeData = action.payload.data;
    });
  },
});

export default homeSlice.reducer;
