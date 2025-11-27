import express from "express";
import discountController from "../../controllers/customer/discountController.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";

const discountRoute = express.Router();

const initDiscountCustomerRoute = (app) => {
  discountRoute.post(
    "/add",
    auth,
    authorize("USER"),
    discountController.applyDiscount
  );
  discountRoute.patch(
    "/update",
    auth,
    authorize("USER"),
    discountController.updateDiscount
  );
  discountRoute.get("/list", discountController.getDiscount);
  app.use("/user/discount", discountRoute);
};
export default initDiscountCustomerRoute;
