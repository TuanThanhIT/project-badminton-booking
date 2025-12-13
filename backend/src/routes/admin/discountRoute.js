import express from "express";
import discountController from "../../controllers/admin/discountController.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";

const discountRoute = express.Router();

const initDiscountAdminRoute = (app) => {
  discountRoute.post(
    "/add",
    auth,
    authorize("ADMIN"),
    discountController.createDiscount
  );
  discountRoute.delete(
    "/delete/:id",
    auth,
    authorize("ADMIN"),
    discountController.deleteDiscount
  );
  discountRoute.patch(
    "/update/:id",
    auth,
    authorize("ADMIN"),
    discountController.updateDiscount
  );
  discountRoute.get(
    "/list",
    auth,
    authorize("ADMIN"),
    discountController.getDiscounts
  );
  app.use("/admin/discount", discountRoute);
};
export default initDiscountAdminRoute;
