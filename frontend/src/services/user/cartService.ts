import {
  type AddCartItemRequest,
  type AddCartItemResponse,
  type CartResponse,
  type DeleteAllCartItemResponse,
  type DeleteCartItemRequest,
  type DeleteCartItemResponse,
  type UpdateCartItemRequest,
  type UpdateCartItemResponse,
} from "../../types/cart";
import instance from "../../utils/axiosCustomize";

const getCartService = () => instance.get<CartResponse>("/user/cart");

const addItemToCartService = (data: AddCartItemRequest) => {
  return instance.post<AddCartItemResponse>("/user/cart", data);
};

const updateCartItemService = (data: UpdateCartItemRequest) => {
  const { cartItemId, quantity } = data;
  return instance.patch<UpdateCartItemResponse>(`/user/cart/${cartItemId}`, {
    quantity,
  });
};

const deleteCartItemService = (data: DeleteCartItemRequest) => {
  const { cartItemId } = data;
  return instance.delete<DeleteCartItemResponse>(`/user/cart/${cartItemId}`);
};

const deleteAllCartItemService = () =>
  instance.delete<DeleteAllCartItemResponse>("/user/cart");

const cartService = {
  getCartService,
  addItemToCartService,
  updateCartItemService,
  deleteCartItemService,
  deleteAllCartItemService,
};

export default cartService;
