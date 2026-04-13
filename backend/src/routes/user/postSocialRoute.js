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
    authorize("USER", "COACH"),
    validate(toggleLikeSchema),
    postSocialController.toggleLikeController,
  );

  // Comment
  postSocialRoute.post(
    "/:postId/comments",
    auth,
    authorize("USER", "COACH"),
    validate(createCommentSchema),
    postSocialController.createCommentController,
  );
  postSocialRoute.get(
    "/:postId/comments",
    auth,
    authorize("USER", "COACH"),
    validate(getCommentsSchema),
    postSocialController.getCommentsController,
  );

  // Re-post (Facebook-style share)
  postSocialRoute.post(
    "/:postId/repost",
    auth,
    authorize("USER", "COACH"),
    validate(createRepostSchema),
    postSocialController.createRepostController,
  );

  app.use("/user/posts", postSocialRoute);
};

export default initPostSocialRoute;

