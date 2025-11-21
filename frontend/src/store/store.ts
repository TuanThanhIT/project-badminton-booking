import { configureStore, combineReducers } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage"; // dùng localStorage
import { persistReducer, persistStore } from "redux-persist";
import cartReducer from "./slices/cartSlice";
import discountReducer from "./slices/discountSlice";
import orderReducer from "./slices/orderSlice";
import productFeedbackReducer from "./slices/productFeedbackSlice";
import courtReducer from "./slices/courtSlice";
import bookingReducer from "./slices/bookingSlice";
import bookingFeedbackReducer from "./slices/bookingFeedbackSlice";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["cart"],
};

const rootReducer = combineReducers({
  cart: cartReducer,
  discount: discountReducer,
  order: orderReducer,
  productFeedback: productFeedbackReducer,
  court: courtReducer,
  booking: bookingReducer,
  bookingFeedback: bookingFeedbackReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
