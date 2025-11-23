import { configureStore, combineReducers } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage"; // dùng localStorage
import { persistReducer, persistStore } from "redux-persist";
import cartReducer from "./slices/cartSlice";
import discountReducer from "./slices/discountSlice";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["cart"], // chỉ persist 2 slice này
};

const rootReducer = combineReducers({
  cart: cartReducer,
  discount: discountReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
