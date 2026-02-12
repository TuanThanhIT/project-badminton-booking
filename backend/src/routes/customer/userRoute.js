import express from "express";
import auth from "../../middlewares/auth.js";
import userController from "../../controllers/customer/userController.js";
import multer from "multer";
import authorize from "../../middlewares/authorize.js";
import validate from "../../middlewares/validate.js";
import {
  updateProfileSchema,
  updateUserInfoSchema,
} from "../../validations/userValidation.js";

const userRoute = express.Router();

const uploader = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
});
const initUserRoute = (app) => {
  userRoute.get(
    "/profile",
    auth,
    authorize("USER", "EMPLOYEE"),
    userController.getProfile,
  );
  userRoute.put(
    "/profile",
    auth,
    authorize("USER", "EMPLOYEE"),
    uploader.single("file"),
    validate(updateProfileSchema),
    userController.updateProfile,
  );
  userRoute.put(
    "/personal-info",
    auth,
    authorize("USER", "EMPLOYEE"),
    validate(updateUserInfoSchema),
    userController.updateUserInfo,
  );
  app.use("/user", userRoute);
};
export default initUserRoute;
