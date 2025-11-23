import cartService from "../../services/customer/cartService.js";

const addItemToCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { quantity, varientId } = req.body;
    const cartItem = await cartService.addItemToCartService(
      userId,
      quantity,
      varientId
    );
    return res.status(201).json(cartItem);
  } catch (error) {
    next(error);
  }
};

const getCartItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cartItems = await cartService.getCartItemService(userId);
    return res.status(200).json(cartItems);
  } catch (error) {
    next(error);
  }
};

const updateQuantity = async (req, res, next) => {
  try {
    const cartItemId = req.params.id;
    const { quantity } = req.body;
    const cartItem = await cartService.updateQuantityService(
      cartItemId,
      quantity
    );
    return res.status(200).json(cartItem);
  } catch (error) {
    next(error);
  }
};

const deleteCartItem = async (req, res, next) => {
  try {
    const cartItemId = req.params.id;
    const deleteCount = await cartService.deleteCartItemService(cartItemId);
    return res.status(200).json(deleteCount);
  } catch (error) {
    next(error);
  }
};

const deleteAllCartItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const deleteCount = await cartService.deleteAllCartItemService(userId);
    return res.status(200).json(deleteCount);
  } catch (error) {
    next(error);
  }
};

const cartController = {
  addItemToCart,
  getCartItem,
  updateQuantity,
  deleteCartItem,
  deleteAllCartItem,
};

export default cartController;
