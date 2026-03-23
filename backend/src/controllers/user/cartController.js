import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import cartService from "../../services/user/cartService.js";

const addItemToCartController = asyncHandler(async (req, res) => {
  const data = { userId: req.user.id, ...req.body };
  const cartItem = await cartService.addItemToCartService(data);
  return res
    .status(201)
    .json(
      new SuccessResponse("Thêm sản phẩm vào giỏ hàng thành công", cartItem),
    );
});

const getCartItemsController = asyncHandler(async (req, res) => {
  const data = { userId: req.user.id };
  const cartItems = await cartService.getCartItemsService(data);
  return res
    .status(200)
    .json(
      new SuccessResponse("Lấy sản phẩm trong giỏ hàng thành công", cartItems),
    );
});

const updateQuantityController = asyncHandler(async (req, res) => {
  const { cartItemId } = req.params;
  const data = { cartItemId, ...req.body };
  const cartItem = await cartService.updateQuantityService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Cập nhật số lượng thành công", cartItem));
});

const deleteCartItemController = asyncHandler(async (req, res) => {
  const { cartItemId } = req.params;
  const data = { cartItemId };
  await cartService.deleteCartItemService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Xóa sản phẩm khỏi giỏi hàng thành công"));
});

const deleteAllCartItemController = asyncHandler(async (req, res) => {
  const data = { userId: req.user.id };
  await cartService.deleteAllCartItemService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Xóa toàn bộ sản phẩm khỏi giỏ hàng thành công"));
});

const cartController = {
  addItemToCartController,
  getCartItemsController,
  updateQuantityController,
  deleteCartItemController,
  deleteAllCartItemController,
};

export default cartController;
