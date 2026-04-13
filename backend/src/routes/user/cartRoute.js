import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import validate from "../../middlewares/validate.js";
import {
  addItemToCartSchema,
  deleteCartItemSchema,
  updateQuantitySchema,
} from "../../validations/cartValidation.js";
import cartController from "../../controllers/user/cartController.js";

const cartRoute = express.Router();

const initCartRoute = (app) => {
  cartRoute.post(
    "/",
    auth,
    authorize("USER"),
    validate(addItemToCartSchema),
    cartController.addItemToCartController,
  );
  cartRoute.get(
    "/",
    auth,
    authorize("USER"),
    cartController.getCartItemsController,
  );
  cartRoute.patch(
    "/:cartItemId",
    auth,
    authorize("USER"),
    validate(updateQuantitySchema),
    cartController.updateQuantityController,
  );
  cartRoute.delete(
    "/",
    auth,
    authorize("USER"),
    cartController.deleteAllCartItemController,
  );
  cartRoute.delete(
    "/:cartItemId",
    auth,
    authorize("USER"),
    validate(deleteCartItemSchema),
    cartController.deleteCartItemController,
  );

  app.use("/user/cart", cartRoute);
};

export default initCartRoute;
