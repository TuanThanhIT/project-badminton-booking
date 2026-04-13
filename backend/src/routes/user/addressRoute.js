import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import validate from "../../middlewares/validate.js";
import addressController from "../../controllers/user/addressController.js";
import {
  addUserAddressSchema,
  deleteUserAddressSchema,
  updateUserAddressSchema,
} from "../../validations/addressValidation.js";

const addressRoute = express.Router();

const initAddressRoute = (app) => {
  addressRoute.get(
    "/",
    auth,
    authorize("USER"),
    addressController.getUserAddressController,
  );
  addressRoute.post(
    "/",
    auth,
    authorize("USER"),
    validate(addUserAddressSchema),
    addressController.addUserAddressController,
  );
  addressRoute.patch(
    "/:addressId",
    auth,
    authorize("USER"),
    validate(updateUserAddressSchema),
    addressController.updateUserAddressController,
  );
  addressRoute.delete(
    "/:addressId",
    auth,
    authorize("USER"),
    validate(deleteUserAddressSchema),
    addressController.deleteUserAddressController,
  );

  app.use("/user/addresses", addressRoute);
};

export default initAddressRoute;
