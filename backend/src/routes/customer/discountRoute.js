import express from "express";
import discountController from "../../controllers/customer/discountController.js";

const discountRoute = express.Router();

const initDiscountCustomerRoute = (app) => {
  discountRoute.post("/add", discountController.applyDiscount);
  app.use("/user/discount", discountRoute);
};
export default initDiscountCustomerRoute;
