import express from "express";
import { ROLE_NAME } from "../../constants/userConstant.js";
import adminPostController from "../../controllers/admin/postController.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import validate from "../../middlewares/validate.js";
import {
  approveModerationPostSchema,
  moderationPostIdSchema,
  pendingModerationPostsSchema,
  rejectModerationPostSchema,
} from "../../validations/adminModerationValidation.js";

const adminPostRoute = express.Router();

const initAdminPostRoute = (app) => {
  adminPostRoute.get(
    "/moderation/review",
    auth,
    authorize(ROLE_NAME.ADMIN),
    validate(pendingModerationPostsSchema),
    adminPostController.getPendingModerationPostsController,
  );

  adminPostRoute.get(
    "/moderation/pending",
    auth,
    authorize(ROLE_NAME.ADMIN),
    validate(pendingModerationPostsSchema),
    adminPostController.getPendingModerationPostsController,
  );

  adminPostRoute.get(
    "/:postId/moderation",
    auth,
    authorize(ROLE_NAME.ADMIN),
    validate(moderationPostIdSchema),
    adminPostController.getPostModerationDetailController,
  );

  adminPostRoute.put(
    "/:postId/moderation/approve",
    auth,
    authorize(ROLE_NAME.ADMIN),
    validate(approveModerationPostSchema),
    adminPostController.approveModerationPostController,
  );

  adminPostRoute.put(
    "/:postId/moderation/reject",
    auth,
    authorize(ROLE_NAME.ADMIN),
    validate(rejectModerationPostSchema),
    adminPostController.rejectModerationPostController,
  );

  adminPostRoute.get(
    "/",
    auth,
    authorize(ROLE_NAME.ADMIN),
    adminPostController.getPostsController,
  );

  adminPostRoute.put(
    "/:postId/toggle-active",
    auth,
    authorize(ROLE_NAME.ADMIN),
    adminPostController.togglePostActiveController,
  );

  adminPostRoute.delete(
    "/:postId",
    auth,
    authorize(ROLE_NAME.ADMIN),
    adminPostController.deletePostController,
  );

  app.use("/admin/posts", adminPostRoute);

  const adminCommentRoute = express.Router();
  adminCommentRoute.get(
    "/",
    auth,
    authorize(ROLE_NAME.ADMIN),
    adminPostController.getCommentsController,
  );
  adminCommentRoute.delete(
    "/:commentId",
    auth,
    authorize(ROLE_NAME.ADMIN),
    adminPostController.deleteCommentController,
  );
  app.use("/admin/comments", adminCommentRoute);
};

export default initAdminPostRoute;
