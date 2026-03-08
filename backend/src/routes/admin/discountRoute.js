import express from "express";
import discountController from "../../controllers/admin/discountController.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import validate from "../../middlewares/validate.js";
import {
  createDiscountSchema,
  deleteDiscountSchema,
  getDiscountsSchema,
  updateDiscountSchema,
} from "../../validations/discountValidation.js";

const discountRoute = express.Router();

const initDiscountAdminRoute = (app) => {
  discountRoute.post(
    "/add",
    auth,
    authorize("ADMIN"),
    validate(createDiscountSchema),
    discountController.createDiscount,
  );
  discountRoute.delete(
    "/delete/:id",
    auth,
    authorize("ADMIN"),
    validate(deleteDiscountSchema),
    discountController.deleteDiscount,
  );
  discountRoute.patch(
    "/update/:id",
    auth,
    authorize("ADMIN"),
    validate(updateDiscountSchema),
    discountController.updateDiscount,
  );
  discountRoute.get(
    "/list",
    auth,
    authorize("ADMIN"),
    validate(getDiscountsSchema),
    discountController.getDiscounts,
  );
  app.use("/admin/discount", discountRoute);
};
export default initDiscountAdminRoute;
