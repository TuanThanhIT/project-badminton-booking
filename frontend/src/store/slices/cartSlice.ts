import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type {
  CartItemResponse,
  CartProductResponse,
  CartResponse,
} from "../../types/cart";
import type { ApiErrorType } from "../../types/error";
import cartService from "../../services/cartService";

interface CartState {
  cart?: CartResponse;
  loading: boolean;
  error: string | undefined;
}

const initialState: CartState = {
  cart: undefined,
  loading: false,
  error: undefined,
};

export const fetchCart = createAsyncThunk<
  CartResponse,
  void,
  { rejectValue: ApiErrorType }
>("cart/fetchCart", async (_, { rejectWithValue }) => {
  try {
    const res = await cartService.getCartService();
    return res.data as CartResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const addCart = createAsyncThunk<
  CartProductResponse,
  { quantity: number; varientId: number },
  { rejectValue: ApiErrorType }
>("cart/addCart", async ({ quantity, varientId }, { rejectWithValue }) => {
  try {
    const res = await cartService.addItemToCartService(quantity, varientId);
    return res.data as CartProductResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const deleteCart = createAsyncThunk<
  CartItemResponse,
  number,
  { rejectValue: ApiErrorType }
>("cart/deleteCart", async (cartItemId, { rejectWithValue }) => {
  try {
    const res = await cartService.deleteCartItemService(cartItemId);
    return res.data as CartItemResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const deleteAllCart = createAsyncThunk<
  number,
  void,
  { rejectValue: ApiErrorType }
>("cart/deleteAllCart", async (_, { rejectWithValue }) => {
  try {
    const res = await cartService.deleteAllCartItemService();
    return res.data as number;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const updateQuantity = createAsyncThunk<
  CartItemResponse,
  { cartItemId: number; quantity: number },
  { rejectValue: ApiErrorType }
>(
  "/cart/updateQuantity",
  async ({ cartItemId, quantity }, { rejectWithValue }) => {
    try {
      const res = await cartService.updateQuantityService(cartItemId, quantity);
      return res.data as CartItemResponse;
    } catch (error) {
      return rejectWithValue(error as ApiErrorType);
    }
  }
);
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCartError(state) {
      state.error = undefined;
    },

    updateQuantityLocal(
      state,
      action: PayloadAction<{ cartItemId: number; quantity: number }>
    ) {
      const cart = state.cart;
      if (!cart) return;
      const idx = cart.cartItems.findIndex(
        (i) => i.id === action.payload.cartItemId
      );
      if (idx >= 0) {
        cart.cartItems[idx].quantity = action.payload.quantity;
        cart.cartItems[idx].subTotal =
          cart.cartItems[idx].price * action.payload.quantity;
      }
    },

    // deleteCartItemLocal(state, action: PayloadAction<{ cartItemId: number }>) {
    //   const cart = state.cart;
    //   if (!cart) return;
    //   cart.cartItems = cart.cartItems.filter(
    //     (item) => item.id !== action.payload.cartItemId
    //   );
    //   // Cập nhật lại totalAmount
    //   cart.totalAmount = cart.cartItems.reduce(
    //     (sum, item) => sum + item.subTotal,
    //     0
    //   );
    // },
  },
  extraReducers: (builder) => {
    builder
      // fetchCart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.userMessage;
      })

      // addCart
      .addCase(addCart.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(addCart.fulfilled, (state, action) => {
        const cart = state.cart;
        if (!cart) return;

        const idx = cart.cartItems.findIndex(
          (i) => i.varientId === action.payload.varientId
        );

        if (idx >= 0) {
          cart.cartItems[idx] = action.payload;
        } else {
          cart.cartItems.push(action.payload);
        }

        cart.totalAmount = cart.cartItems.reduce(
          (sum, item) => sum + item.subTotal,
          0
        );

        state.loading = false;
      })
      .addCase(addCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.userMessage;
      })

      // deleteCart
      .addCase(deleteCart.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(deleteCart.fulfilled, (state, action) => {
        const cart = state.cart;
        if (!cart) return;

        cart.cartItems = cart.cartItems.filter(
          (item) => item.id !== action.payload.id
        );
        // Cập nhật lại totalAmount
        cart.totalAmount = cart.cartItems.reduce(
          (sum, item) => sum + item.subTotal,
          0
        );

        state.loading = false;
      })
      .addCase(deleteCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.userMessage;
      })

      // deleteAllCart
      .addCase(deleteAllCart.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(deleteAllCart.fulfilled, (state) => {
        const cart = state.cart;
        if (!cart) return;
        cart.cartItems = [];
        cart.totalAmount = 0;
        state.loading = false;
      })
      .addCase(deleteAllCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.userMessage;
      })

      // updateQuantity
      .addCase(updateQuantity.fulfilled, (state, action) => {
        const cart = state.cart;
        if (!cart) return;
        const idx = cart.cartItems.findIndex((i) => i.id === action.payload.id);
        if (idx >= 0) {
          cart.cartItems[idx].quantity = action.payload.quantity;
          cart.cartItems[idx].subTotal =
            cart.cartItems[idx].price * action.payload.quantity;
        }
        cart.totalAmount = cart.cartItems.reduce(
          (sum, i) => sum + i.subTotal,
          0
        );
      })

      .addCase(updateQuantity.rejected, (state, action) => {
        state.error = action.payload?.userMessage;
      });
  },
});
export const { clearCartError, updateQuantityLocal } = cartSlice.actions;
export default cartSlice.reducer;
