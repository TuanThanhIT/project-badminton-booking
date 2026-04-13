import type { ApiResponse } from "./api";

export type CartItem = {
  id: number;
  quantity: number;
  subTotal: number;
  productName: string;
  thumbnailUrl: string;
  variantId: number;
  stock: number;
  color: string;
  size: string;
  material: string;
  price: number;
};

export type Cart = {
  id: number;
  totalAmount: number;
  cartItems: CartItem[];
};

export type CartResponse = ApiResponse<Cart>;

export type AddCartItemResponse = ApiResponse<CartItem>;

export type UpdateCartItemData = {
  id: number;
  quantity: number;
  subTotal: number;
  cartId: number;
  variantId: number;
};

export type UpdateCartItemResponse = ApiResponse<UpdateCartItemData>;

export type DeleteCartItemResponse = ApiResponse<null>;

export type DeleteAllCartItemResponse = ApiResponse<null>;

export type AddCartItemRequest = {
  quantity: number;
  variantId: number;
};

export type UpdateCartItemRequest = {
  cartItemId: number;
  quantity: number;
};

export type DeleteCartItemRequest = {
  cartItemId: number;
};
