import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import validate from "../../middlewares/validate.js";
import postSocialController from "../../controllers/user/postSocialController.js";
import {
  createCommentSchema,
  deleteCommentSchema,
  createRepostSchema,
  getCommentsSchema,
  reportCommentSchema,
  toggleLikeSchema,
} from "../../validations/postSocialValidation.js";
import { ROLE_NAME } from "../../constants/userConstant.js";

const postSocialRoute = express.Router();

const initPostSocialRoute = (app) => {
  // Like
  postSocialRoute.post(
    "/:postId/like",
    auth,
    authorize(ROLE_NAME.USER, ROLE_NAME.COACH),
    validate(toggleLikeSchema),
    postSocialController.toggleLikeController,
  );

  // Comment
  postSocialRoute.post(
    "/:postId/comments",
    auth,
    authorize(ROLE_NAME.USER, ROLE_NAME.COACH),
    validate(createCommentSchema),
    postSocialController.createCommentController,
  );
  postSocialRoute.get(
    "/:postId/comments",
    auth,
    authorize(ROLE_NAME.USER, ROLE_NAME.COACH),
    validate(getCommentsSchema),
    postSocialController.getCommentsController,
  );

  // Re-post (Facebook-style share)
  postSocialRoute.post(
    "/:postId/repost",
    auth,
    authorize(ROLE_NAME.USER, ROLE_NAME.COACH),
    validate(createRepostSchema),
    postSocialController.createRepostController,
  );

  app.use("/user/posts", postSocialRoute);

  const commentSocialRoute = express.Router();
  commentSocialRoute.post(
    "/:commentId/report",
    auth,
    authorize(ROLE_NAME.USER, ROLE_NAME.COACH),
    validate(reportCommentSchema),
    postSocialController.reportCommentController,
  );
  commentSocialRoute.delete(
    "/:commentId",
    auth,
    authorize(ROLE_NAME.USER, ROLE_NAME.COACH),
    validate(deleteCommentSchema),
    postSocialController.deleteCommentController,
  );
  app.use("/user/comments", commentSocialRoute);
};

export default initPostSocialRoute;
