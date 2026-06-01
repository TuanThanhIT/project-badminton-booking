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
import { ROLE_NAME } from "../../constants/userConstant.js";

const addressRoute = express.Router();

const initAddressRoute = (app) => {
  addressRoute.get(
    "/",
    auth,
    authorize(ROLE_NAME.USER, ROLE_NAME.COACH),
    addressController.getUserAddressController,
  );
  addressRoute.post(
    "/",
    auth,
    authorize(ROLE_NAME.USER, ROLE_NAME.COACH),
    validate(addUserAddressSchema),
    addressController.addUserAddressController,
  );
  addressRoute.patch(
    "/:addressId",
    auth,
    authorize(ROLE_NAME.USER, ROLE_NAME.COACH),
    validate(updateUserAddressSchema),
    addressController.updateUserAddressController,
  );
  addressRoute.delete(
    "/:addressId",
    auth,
    authorize(ROLE_NAME.USER, ROLE_NAME.COACH),
    validate(deleteUserAddressSchema),
    addressController.deleteUserAddressController,
  );

  app.use("/user/addresses", addressRoute);
};

export default initAddressRoute;
