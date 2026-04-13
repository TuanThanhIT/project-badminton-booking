import { configureStore, combineReducers } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage"; // dùng localStorage
import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import authReducer from "./slices/user/authSlice";
import uiReducer from "./slices/uiSlice";
import cateReducer from "./slices/user/cateSlice";
import productReducer from "./slices/user/productSlice";
import branchReducer from "./slices/user/branchSlice";
import courtReducer from "./slices/user/courtSlice";
import cartReducer from "./slices/user/cartSlice";
import { authMiddleware } from "./middlewares/authMiddleware";
import postReducer from "./slices/user/postSlice";
import profileReducer from "./slices/user/profileSlice";
import conversationReducer from "./slices/user/conversationSlice";

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
  post: postReducer,
  profile: profileReducer,
  conversation: conversationReducer,
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
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
