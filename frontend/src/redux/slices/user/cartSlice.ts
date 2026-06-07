import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type {
  AddCartItemRequest,
  AddCartItemResponse,
  Cart,
  CartItem,
  CartResponse,
  DeleteAllCartItemResponse,
  DeleteCartItemRequest,
  DeleteCartItemResponse,
  UpdateCartItemRequest,
  UpdateCartItemResponse,
} from "../../../types/cart";
import type { ApiErrorType } from "../../../types/error";
import cartService from "../../../services/user/cartService";

interface CartState {
  cartItem?: CartItem;
  cart?: Cart;
  prevCartItem?: CartItem;
}

const initialState: CartState = {
  cartItem: undefined,
  cart: undefined,
  prevCartItem: undefined,
};

const toMoneyNumber = (value: number | string | null | undefined) =>
  Number(value || 0);

const getCartTotalAmount = (cartItems: CartItem[]) =>
  cartItems.reduce((sum, item) => sum + toMoneyNumber(item.subTotal), 0);

export const getCart = createAsyncThunk<
  CartResponse,
  void,
  { rejectValue: ApiErrorType }
>("cart/getCart", async (_, { rejectWithValue }) => {
  try {
    const res = await cartService.getCartService();
    return res.data as CartResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const addCartItem = createAsyncThunk<
  AddCartItemResponse,
  { data: AddCartItemRequest },
  { rejectValue: ApiErrorType }
>("cart/addCartItem", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await cartService.addItemToCartService(data);
    return res.data as AddCartItemResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const deleteCartItem = createAsyncThunk<
  DeleteCartItemResponse,
  { data: DeleteCartItemRequest },
  { rejectValue: ApiErrorType }
>("cart/deleteCartItem", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await cartService.deleteCartItemService(data);
    return res.data as DeleteCartItemResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const deleteAllCartItem = createAsyncThunk<
  DeleteAllCartItemResponse,
  void,
  { rejectValue: ApiErrorType }
>("cart/deleteAllCartItem", async (_, { rejectWithValue }) => {
  try {
    const res = await cartService.deleteAllCartItemService();
    return res.data as DeleteAllCartItemResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const updateCartItem = createAsyncThunk<
  UpdateCartItemResponse,
  { data: UpdateCartItemRequest },
  { rejectValue: ApiErrorType }
>("cart/updateCartItem", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await cartService.updateCartItemService(data);
    return res.data as UpdateCartItemResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    updateQuantityLocal(
      state,
      action: PayloadAction<{ data: UpdateCartItemRequest }>,
    ) {
      const cart = state.cart;
      if (!cart) return;
      const idx = cart.cartItems.findIndex(
        (i) => i.id === action.payload.data.cartItemId,
      );
      if (idx >= 0) {
        state.prevCartItem = { ...cart.cartItems[idx] };
        cart.cartItems[idx].quantity = action.payload.data.quantity;
        cart.cartItems[idx].subTotal =
          toMoneyNumber(cart.cartItems[idx].price) *
          action.payload.data.quantity;
      }
      cart.totalAmount = getCartTotalAmount(cart.cartItems);
    },
    deleteCartItemLocal(
      state,
      action: PayloadAction<{ data: DeleteCartItemRequest }>,
    ) {
      const cart = state.cart;
      if (!cart) return;
      const item = cart.cartItems.find(
        (it) => it.id === action.payload.data.cartItemId,
      );
      if (!state.prevCartItem) {
        state.prevCartItem = item ? { ...item } : undefined;
      }
      cart.cartItems = cart.cartItems.filter(
        (item) => item.id !== action.payload.data.cartItemId,
      );
      cart.totalAmount = getCartTotalAmount(cart.cartItems);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCart.fulfilled, (state, action) => {
        state.cart = action.payload.data;
      })
      .addCase(deleteAllCartItem.fulfilled, (state) => {
        const cart = state.cart;
        if (!cart) return;
        cart.cartItems = [];
        cart.totalAmount = 0;
      })
      .addCase(addCartItem.fulfilled, (state, action) => {
        const cart = state.cart;
        if (!cart) return;
        const idx = cart.cartItems.findIndex(
          (item) => item.id === action.payload.data.id,
        );
        if (idx >= 0) {
          cart.cartItems[idx].quantity = action.payload.data.quantity;
          cart.cartItems[idx].subTotal =
            toMoneyNumber(cart.cartItems[idx].price) *
            cart.cartItems[idx].quantity;
        } else {
          cart.cartItems.push(action.payload.data);
        }
        cart.totalAmount = getCartTotalAmount(cart.cartItems);
      })

      .addCase(updateCartItem.fulfilled, (state) => {
        state.prevCartItem = undefined;
      })
      .addCase(updateCartItem.rejected, (state) => {
        if (!state.prevCartItem || !state.cart) return;
        const idx = state.cart.cartItems.findIndex(
          (item) => item.id === state.prevCartItem?.id,
        );
        if (idx >= 0) {
          state.cart.cartItems[idx] = state.prevCartItem;
          state.cart.totalAmount = getCartTotalAmount(state.cart.cartItems);
        }
        state.prevCartItem = undefined;
      })

      .addCase(deleteCartItem.fulfilled, (state) => {
        state.prevCartItem = undefined;
      })
      .addCase(deleteCartItem.rejected, (state) => {
        if (!state.prevCartItem || !state.cart) return;
        state.cart.cartItems.push(state.prevCartItem);
        state.cart.totalAmount = getCartTotalAmount(state.cart.cartItems);
        state.prevCartItem = undefined;
      });
  },
});
export const { updateQuantityLocal, deleteCartItemLocal } = cartSlice.actions;
export default cartSlice.reducer;
