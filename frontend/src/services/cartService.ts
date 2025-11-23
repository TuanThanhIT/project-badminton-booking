import type {
  CartResponse,
  CartProductResponse,
  CartItemResponse,
} from "../types/cart";
import instance from "../utils/axiosCustomize";

const getCartService = () => instance.get<CartResponse>("/user/cart/list");

const addItemToCartService = (quantity: number, varientId: number) => {
  const data = { quantity, varientId };
  return instance.post<CartProductResponse>("/user/cart/add", data);
};

const updateQuantityService = (cartItemId: number, quantity: number) => {
  const data = { quantity };
  return instance.put<CartItemResponse>(
    `/user/cart/update/${cartItemId}`,
    data
  );
};

const deleteCartItemService = (cartItemId: number) =>
  instance.delete<CartItemResponse>(`/user/cart/delete/${cartItemId}`);

const deleteAllCartItemService = () =>
  instance.delete<number>("/user/cart/delete/all");

const cartService = {
  getCartService,
  addItemToCartService,
  updateQuantityService,
  deleteCartItemService,
  deleteAllCartItemService,
};

export default cartService;
