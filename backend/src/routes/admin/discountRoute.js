import express from "express";
import discountController from "../../controllers/admin/discountController.js";

const discountRoute = express.Router();

const initDiscountAdminRoute = (app) => {
  discountRoute.post("/add", discountController.createDiscount);
  app.use("/admin/discount", discountRoute);
};
export default initDiscountAdminRoute;
