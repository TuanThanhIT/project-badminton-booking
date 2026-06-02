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
import { ROLE_NAME } from "../../constants/userConstant.js";

const cartRoute = express.Router();

const initCartRoute = (app) => {
  cartRoute.post(
    "/",
    auth,
    authorize(ROLE_NAME.USER, ROLE_NAME.COACH),
    validate(addItemToCartSchema),
    cartController.addItemToCartController,
  );
  cartRoute.get(
    "/",
    auth,
    authorize(ROLE_NAME.USER, ROLE_NAME.COACH),
    cartController.getCartItemsController,
  );
  cartRoute.patch(
    "/:cartItemId",
    auth,
    authorize(ROLE_NAME.USER, ROLE_NAME.COACH),
    validate(updateQuantitySchema),
    cartController.updateQuantityController,
  );
  cartRoute.delete(
    "/",
    auth,
    authorize(ROLE_NAME.USER, ROLE_NAME.COACH),
    cartController.deleteAllCartItemController,
  );
  cartRoute.delete(
    "/:cartItemId",
    auth,
    authorize(ROLE_NAME.USER, ROLE_NAME.COACH),
    validate(deleteCartItemSchema),
    cartController.deleteCartItemController,
  );

  app.use("/user/cart", cartRoute);
};

export default initCartRoute;
