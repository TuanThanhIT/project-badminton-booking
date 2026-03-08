import express from "express";
import cartController from "../../controllers/customer/cartController.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import validate from "../../middlewares/validate.js";
import {
  addItemToCartSchema,
  deleteCartItemSchema,
  updateQuantitySchema,
} from "../../validations/cartValidation.js";

const cartRoute = express.Router();

const initCartCustomerRoute = (app) => {
  cartRoute.post(
    "/add",
    auth,
    authorize("USER"),
    validate(addItemToCartSchema),
    cartController.addItemToCart,
  );
  cartRoute.get("/list", auth, authorize("USER"), cartController.getCartItems);
  cartRoute.put(
    "/update/:cartItemId",
    auth,
    authorize("USER"),
    validate(updateQuantitySchema),
    cartController.updateQuantity,
  );
  cartRoute.delete(
    "/delete/all",
    auth,
    authorize("USER"),
    cartController.deleteAllCartItem,
  );
  cartRoute.delete(
    "/delete/:cartItemId",
    auth,
    authorize("USER"),
    validate(deleteCartItemSchema),
    cartController.deleteCartItem,
  );
  app.use("/user/cart", cartRoute);
};
export default initCartCustomerRoute;
