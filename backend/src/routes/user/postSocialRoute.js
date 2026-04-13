import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import validate from "../../middlewares/validate.js";
import postSocialController from "../../controllers/user/postSocialController.js";
import {
  createCommentSchema,
  createRepostSchema,
  getCommentsSchema,
  toggleLikeSchema,
} from "../../validations/postSocialValidation.js";

const postSocialRoute = express.Router();

const initPostSocialRoute = (app) => {
  // Like
  postSocialRoute.post(
    "/:postId/like",
    auth,
    authorize("User", "Coach"),
    validate(toggleLikeSchema),
    postSocialController.toggleLikeController,
  );

  // Comment
  postSocialRoute.post(
    "/:postId/comments",
    auth,
    authorize("User", "Coach"),
    validate(createCommentSchema),
    postSocialController.createCommentController,
  );
  postSocialRoute.get(
    "/:postId/comments",
    auth,
    authorize("User", "Coach"),
    validate(getCommentsSchema),
    postSocialController.getCommentsController,
  );

  // Re-post (Facebook-style share)
  postSocialRoute.post(
    "/:postId/repost",
    auth,
    authorize("User", "Coach"),
    validate(createRepostSchema),
    postSocialController.createRepostController,
  );

  app.use("/user/posts", postSocialRoute);
};

export default initPostSocialRoute;

