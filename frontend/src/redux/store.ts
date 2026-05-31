import { configureStore, combineReducers } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage"; // dùng localStorage
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";
import { authMiddleware } from "./middlewares/authMiddleware";
import { setStore } from "./storeRef";
import authReducer from "./slices/user/authSlice";
import uiReducer from "./slices/uiSlice";
import cateReducer from "./slices/user/cateSlice";
import productReducer from "./slices/user/productSlice";
import branchReducer from "./slices/user/branchSlice";
import courtReducer from "./slices/user/courtSlice";
import discountReducer from "./slices/user/discountSlice";
import cartReducer from "./slices/user/cartSlice";
import walletReducer from "./slices/user/walletSlice";
import addressReducer from "./slices/user/addressSlice";
import postReducer from "./slices/user/postSlice";
import profileReducer from "./slices/user/profileSlice";
import conversationReducer from "./slices/user/conversationSlice";
import monthlyBookingReducer from "./slices/user/monthlyBookingSlice";
import bookingReducer from "./slices/user/bookingSlice";
import orderReducer from "./slices/user/orderSlice";
import feedbackReducer from "./slices/user/feedbackSlice";
import notificationReducer from "./slices/user/notificationSlice";
import homeReducer from "./slices/user/homeSlice";
import employeeWorkShiftReducer from "./slices/employee/workShiftSlice";
import employeeCounterReducer from "./slices/employee/counterSlice";
import employeeOrderReducer from "./slices/employee/orderSlice";
import employeeBookingReducer from "./slices/employee/bookingSlice";

///MANAGER
import managerCourtReducer from "./slices/manager/courtSlice";
import managerBranchReducer from "./slices/manager/branchSlice";
import managerEmployeeReducer from "./slices/manager/employeeSlice";
import managerProductReducer from "./slices/manager/productSlice";
import managerBeverageReducer from "./slices/manager/beverageSlice";
import managerWorkShiftReducer from "./slices/manager/workShiftSlice";
import managerSalaryReducer from "./slices/manager/salarySlice";
import managerRevenueReducer from "./slices/manager/revenueSlice";
import managerOrderReducer from "./slices/manager/orderSlice";
import managerConversationReducer from "./slices/manager/conversationSlice";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["cart", "offlineEpl"],
};

const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  cate: cateReducer,
  product: productReducer,
  branch: branchReducer,
  court: courtReducer,
  cart: cartReducer,
  wallet: walletReducer,
  address: addressReducer,
  post: postReducer,
  profile: profileReducer,
  conversation: conversationReducer,
  discount: discountReducer,
  monthlyBooking: monthlyBookingReducer,
  booking: bookingReducer,
  order: orderReducer,
  feedback: feedbackReducer,
  notification: notificationReducer,
  home: homeReducer,
  employeeWorkShift: employeeWorkShiftReducer,
  employeeCounter: employeeCounterReducer,
  employeeOrder: employeeOrderReducer,
  employeeBooking: employeeBookingReducer,

  ///MANAGER
  managerCourt: managerCourtReducer,
  managerBranch: managerBranchReducer,
  managerEmployee: managerEmployeeReducer,
  managerProduct: managerProductReducer,
  managerBeverage: managerBeverageReducer,
  managerWorkShift: managerWorkShiftReducer,
  managerSalary: managerSalaryReducer,
  managerRevenue: managerRevenueReducer,
  managerOrder: managerOrderReducer,
  managerConversation: managerConversationReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(authMiddleware),
});

setStore(store);

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
