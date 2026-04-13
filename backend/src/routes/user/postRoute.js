import express from "express";
import postController from "../../controllers/user/postController.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import validate from "../../middlewares/validate.js";
import {
  createPostSchema,
  deletePostSchema,
  getPostByIdSchema,
  getPostsSchema,
  updatePostSchema,
} from "../../validations/postValidation.js";

const postRoute = express.Router();

const initPostRoute = (app) => {
  postRoute.post(
    "/",
    auth,
    authorize("USER", "Coach"),
    validate(createPostSchema),
    postController.createPostController,
  );

  postRoute.get(
    "/",
    auth,
    authorize("USER", "Coach"),
    validate(getPostsSchema),
    postController.getPostsController,
  );

  postRoute.get(
    "/:postId",
    auth,
    authorize("USER", "Coach"),
    validate(getPostByIdSchema),
    postController.getPostByIdController,
  );

  postRoute.put(
    "/:id",
    auth,
    authorize("USER", "Coach"),
    validate(updatePostSchema),
    postController.updatePostController,
  );

  postRoute.delete(
    "/:id",
    auth,
    authorize("USER", "Coach"),
    validate(deletePostSchema),
    postController.deletePostController,
  );

  app.use("/user/posts", postRoute);
};

export default initPostRoute;