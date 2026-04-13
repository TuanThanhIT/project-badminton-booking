import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import validate from "../../middlewares/validate.js";
import profileAvatarUpload from "../../middlewares/uploadAvatar.js";
import profileController from "../../controllers/user/profileController.js";
import {
  getPublicProfileSchema,
  updateMyProfileSchema,
} from "../../validations/profileValidation.js";

const profileRoute = express.Router();

const initProfileRoute = (app) => {
  profileRoute.get(
    "/me",
    auth,
    authorize("User", "Coach"),
    profileController.getMyProfileController,
  );

  profileRoute.patch(
    "/me",
    auth,
    authorize("User", "Coach"),
    validate(updateMyProfileSchema),
    profileController.updateMyProfileController,
  );

  profileRoute.post(
    "/me/avatar",
    auth,
    authorize("User", "Coach"),
    profileAvatarUpload.single("avatar"),
    profileController.uploadMyAvatarController,
  );

  profileRoute.get(
    "/:userId",
    auth,
    authorize("User", "Coach"),
    validate(getPublicProfileSchema),
    profileController.getPublicProfileController,
  );

  app.use("/user/profile", profileRoute);
};

export default initProfileRoute;
