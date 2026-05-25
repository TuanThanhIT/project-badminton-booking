import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import { ROLE_NAME } from "../../constants/userConstant.js";
import adminPostController from "../../controllers/admin/postController.js";

const adminPostRoute = express.Router();

const initAdminPostRoute = (app) => {
  adminPostRoute.get("/", auth, authorize(ROLE_NAME.ADMIN), adminPostController.getPostsController);
  adminPostRoute.put("/:postId/toggle-active", auth, authorize(ROLE_NAME.ADMIN), adminPostController.togglePostActiveController);
  adminPostRoute.delete("/:postId", auth, authorize(ROLE_NAME.ADMIN), adminPostController.deletePostController);

  app.use("/admin/posts", adminPostRoute);

  // comments
  const adminCommentRoute = express.Router();
  adminCommentRoute.get("/", auth, authorize(ROLE_NAME.ADMIN), adminPostController.getCommentsController);
  adminCommentRoute.delete("/:commentId", auth, authorize(ROLE_NAME.ADMIN), adminPostController.deleteCommentController);
  app.use("/admin/comments", adminCommentRoute);
};

export default initAdminPostRoute;
