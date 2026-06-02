import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import validate from "../../middlewares/validate.js";
import profileAvatarUpload from "../../middlewares/uploadAvatar.js";
import coachApplicationUserController from "../../controllers/user/coachApplicationController.js";
import { submitCoachApplicationSchema } from "../../validations/coachApplicationValidation.js";
import { ROLE_NAME } from "../../constants/userConstant.js";

const coachApplicationRoute = express.Router();

const initCoachApplicationRoute = (app) => {
  coachApplicationRoute.get(
    "/me",
    auth,
    authorize(ROLE_NAME.USER),
    coachApplicationUserController.getMyCoachApplicationController,
  );

  coachApplicationRoute.post(
    "/certificate-images",
    auth,
    authorize(ROLE_NAME.USER),
    profileAvatarUpload.array("images", 5),
    coachApplicationUserController.uploadApplicationCertificatesController,
  );

  coachApplicationRoute.post(
    "/",
    auth,
    authorize(ROLE_NAME.USER),
    validate(submitCoachApplicationSchema),
    coachApplicationUserController.submitCoachApplicationController,
  );

  app.use("/user/coach-applications", coachApplicationRoute);
};

export default initCoachApplicationRoute;
