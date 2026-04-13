import { configureStore, combineReducers } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage"; // dùng localStorage
import { persistReducer, persistStore } from "redux-persist";
import authReducer from "./slices/user/authSlice";
import uiReducer from "./slices/uiSlice";
import branchReducer from "./slices/user/branchSlice";
import courtReducer from "./slices/user/courtSlice";
import discountReducer from "./slices/user/discountSlice";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["cart", "offlineEpl"],
};

const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  branch: branchReducer,
  court: courtReducer,
  discount: discountReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
