import { configureStore, combineReducers } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage"; // dùng localStorage
import { persistReducer, persistStore } from "redux-persist";
import cartReducer from "./slices/customer/cartSlice";
import discountReducer from "./slices/customer/discountSlice";
import orderReducer from "./slices/customer/orderSlice";
import productFeedbackReducer from "./slices/customer/productFeedbackSlice";
import courtReducer from "./slices/customer/courtSlice";
import bookingReducer from "./slices/customer/bookingSlice";
import bookingFeedbackReducer from "./slices/customer/bookingFeedbackSlice";
import workShiftReducer from "./slices/employee/workShiftSlice";
import notificationReducer from "./slices/customer/notificationSlice";
import orderEplReducer from "./slices/employee/orderSlice";
import bookingEplReducer from "./slices/employee/bookingSlice";
import beverageEplReducer from "./slices/employee/beverageSlice";
import courtEplReducer from "./slices/employee/courtSlice";
import productEplReducer from "./slices/employee/productSlice";
import draftEplReducer from "./slices/employee/draftSlice";
import offlineEplReducer from "./slices/employee/offlineSlice";
import notificationEplReducer from "./slices/employee/notificationSlice";
import discountAdminReducer from "./slices/admin/discountSlice";
import revenueAdminReducer from "./slices/admin/revenueSlice";
import dashboardAdminReducer from "./slices/admin/dashboardSlice";
import notificationAdmReducer from "./slices/admin/notificationSlice";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["cart", "offlineEpl"],
};

const rootReducer = combineReducers({
  cart: cartReducer,
  discount: discountReducer,
  order: orderReducer,
  productFeedback: productFeedbackReducer,
  court: courtReducer,
  booking: bookingReducer,
  bookingFeedback: bookingFeedbackReducer,
  workShiftEpl: workShiftReducer,
  orderEpl: orderEplReducer,
  bookingEpl: bookingEplReducer,
  courtEpl: courtEplReducer,
  beverageEpl: beverageEplReducer,
  productEpl: productEplReducer,
  draftEpl: draftEplReducer,
  offlineEpl: offlineEplReducer,
  notificationEpl: notificationEplReducer,
  notification: notificationReducer,
  discountAdmin: discountAdminReducer,
  revenueAdmin: revenueAdminReducer,
  dashboardAdmin: dashboardAdminReducer,
  notificationAdm: notificationAdmReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
