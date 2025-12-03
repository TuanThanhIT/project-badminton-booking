import express from "express";
import cartController from "../../controllers/customer/cartController.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";

const cartRoute = express.Router();

const initCartCustomerRoute = (app) => {
  cartRoute.post("/add", auth, authorize("USER"), cartController.addItemToCart);
  cartRoute.get("/list", auth, authorize("USER"), cartController.getCartItem);
  cartRoute.put(
    "/update/:id",
    auth,
    authorize("USER"),
    cartController.updateQuantity
  );
  cartRoute.delete(
    "/delete/all",
    auth,
    authorize("USER"),
    cartController.deleteAllCartItem
  );
  cartRoute.delete(
    "/delete/:id",
    auth,
    authorize("USER"),
    cartController.deleteCartItem
  );
  app.use("/user/cart", cartRoute);
};
export default initCartCustomerRoute;
