import {
  createSlice,
  isPending,
  isFulfilled,
  isRejectedWithValue,
} from "@reduxjs/toolkit";

interface UiState {
  loadingCount: number;
}

const initialState: UiState = {
  loadingCount: 0,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addMatcher(isPending, (state) => {
        state.loadingCount += 1;
      })
      .addMatcher(isFulfilled, (state) => {
        state.loadingCount = Math.max(0, state.loadingCount - 1);
      })
      .addMatcher(isRejectedWithValue, (state) => {
        state.loadingCount = Math.max(0, state.loadingCount - 1);
      });
  },
});

export default uiSlice.reducer;
