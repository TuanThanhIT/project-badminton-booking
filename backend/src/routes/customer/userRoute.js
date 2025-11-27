import express from "express";
import auth from "../../middlewares/auth.js";
import userController from "../../controllers/customer/userController.js";
import multer from "multer";
import authorize from "../../middlewares/authorize.js";

const userRoute = express.Router();

var uploader = multer({
  storage: multer.diskStorage({}),
  limits: { fileSize: 2 * 1024 * 1024 },
});

const initUserRoute = (app) => {
  userRoute.get("/profile", auth, authorize("USER"), userController.getProfile);
  userRoute.put(
    "/profile/update",
    auth,
    authorize("USER"),
    uploader.single("file"),
    userController.updateProfile
  );
  userRoute.put(
    "/profile/update/checkout",
    auth,
    authorize("USER"),
    userController.updateUserInfo
  );
  app.use("/user", userRoute);
};
export default initUserRoute;
