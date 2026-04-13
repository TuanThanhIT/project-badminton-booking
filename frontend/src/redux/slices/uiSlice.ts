import {
  createSlice,
  isPending,
  isFulfilled,
  isRejectedWithValue,
} from "@reduxjs/toolkit";

const getLoadingKey = (action: any) => {
  return action.type.split("/").slice(0, 2).join("/");
};

interface UiState {
  loadingMap: Record<string, boolean>;
}

const initialState: UiState = {
  loadingMap: {},
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addMatcher(isPending, (state, action) => {
        const key = getLoadingKey(action);
        state.loadingMap[key] = true;
      })
      .addMatcher(isFulfilled, (state, action) => {
        const key = getLoadingKey(action);
        state.loadingMap[key] = false;
      })
      .addMatcher(isRejectedWithValue, (state, action) => {
        const key = getLoadingKey(action);
        state.loadingMap[key] = false;
      });
  },
});

export default uiSlice.reducer;