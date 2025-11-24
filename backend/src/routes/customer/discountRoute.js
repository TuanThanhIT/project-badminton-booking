import express from "express";
import discountController from "../../controllers/customer/discountController.js";

const discountRoute = express.Router();

const initDiscountCustomerRoute = (app) => {
  discountRoute.post("/add", discountController.applyDiscount);
  discountRoute.patch("/update", discountController.updateDiscount);
  discountRoute.get("/list", discountController.getDiscount);
  app.use("/user/discount", discountRoute);
};
export default initDiscountCustomerRoute;
