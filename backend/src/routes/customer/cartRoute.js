import express from "express";
import cartController from "../../controllers/customer/cartController.js";

const cartRoute = express.Router();

const initCartCustomerRoute = (app) => {
  cartRoute.post("/add", cartController.addItemToCart);
  cartRoute.get("/list", cartController.getCartItem);
  cartRoute.put("/update/:id", cartController.updateQuantity);
  cartRoute.delete("/delete/all", cartController.deleteAllCartItem);
  cartRoute.delete("/delete/:id", cartController.deleteCartItem);
  app.use("/user/cart", cartRoute);
};
export default initCartCustomerRoute;
