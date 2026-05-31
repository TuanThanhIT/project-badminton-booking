import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import validate from "../../middlewares/validate.js";
import userSearchController from "../../controllers/user/userSearchController.js";
import { searchUsersSchema } from "../../validations/userSearchValidation.js";
import { ROLE_NAME } from "../../constants/userConstant.js";

const userSearchRoute = express.Router();

const initUserSearchRoute = (app) => {
  userSearchRoute.get(
    "/search",
    auth,
    authorize(ROLE_NAME.USER),
    validate(searchUsersSchema),
    userSearchController.searchUsersController,
  );

  app.use("/user/users", userSearchRoute);
};

export default initUserSearchRoute;
