import express from "express";
import discountController from "../../controllers/admin/discountController.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";

const discountRoute = express.Router();

const initDiscountAdminRoute = (app) => {
  discountRoute.post(
    "/add",
    auth,
    authorize(),
    discountController.createDiscount
  );
  app.use("/admin/discount", discountRoute);
};
export default initDiscountAdminRoute;
