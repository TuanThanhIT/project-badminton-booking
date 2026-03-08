import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import cartService from "../../services/customer/cartService.js";

const addItemToCart = asyncHandler(async (req, res) => {
  const data = { userId: req.user.id, ...req.body };
  const cartItem = await cartService.addItemToCartService(data);
  return res
    .status(201)
    .json(
      new SuccessResponse("Thêm sản phẩm vào giỏ hàng thành công", cartItem),
    );
});

const getCartItems = asyncHandler(async (req, res) => {
  const data = { userId: req.user.id };
  const cartItems = await cartService.getCartItemService(data);
  return res
    .status(200)
    .json(
      new SuccessResponse("Lấy sản phẩm trong giỏ hàng thành công", cartItems),
    );
});

const updateQuantity = asyncHandler(async (req, res) => {
  const { cartItemId } = req.params;
  const data = { cartItemId, ...req.body };
  const cartItem = await cartService.updateQuantityService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Cập nhật số lượng thành công", cartItem));
});

const deleteCartItem = asyncHandler(async (req, res) => {
  const { cartItemId } = req.params;
  const data = { cartItemId };
  const deleteCount = await cartService.deleteCartItemService(data);
  return res
    .status(200)
    .json(
      new SuccessResponse(
        "Xóa sản phẩm khỏi giỏi hàng thành công",
        deleteCount,
      ),
    );
});

const deleteAllCartItem = asyncHandler(async (req, res) => {
  const data = { userId: req.user.id };
  const deleteCount = await cartService.deleteAllCartItemService(data);
  return res
    .status(200)
    .json(
      new SuccessResponse(
        "Xóa toàn bộ sản phẩm khỏi giỏ hàng thành công",
        deleteCount,
      ),
    );
});

const cartController = {
  addItemToCart,
  getCartItems,
  updateQuantity,
  deleteCartItem,
  deleteAllCartItem,
};

export default cartController;
