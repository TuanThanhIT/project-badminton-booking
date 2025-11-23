import express from "express";
import auth from "../../middlewares/auth.js";
import userController from "../../controllers/customer/userController.js";
import multer from "multer";

const userRoute = express.Router();

var uploader = multer({
  storage: multer.diskStorage({}),
  limits: { fileSize: 1 * 1024 * 1024 },
});

const initUserRoute = (app) => {
  userRoute.get("/profile", userController.getProfile);
  userRoute.put(
    "/profile/update",
    uploader.single("file"),
    userController.updateProfile
  );
  userRoute.put("/profile/update/checkout", userController.updateUserInfo);
  app.use("/user", auth, userRoute);
};
export default initUserRoute;
