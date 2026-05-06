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
    authorize("USER","COACH"),
    validate(createPostSchema),
    postController.createPostController,
  );

  postRoute.get(
    "/",
    auth,
    authorize("USER", "COACH"),
    validate(getPostsSchema),
    postController.getPostsController,
  );

  postRoute.get(
    "/:postId",
    auth,
    authorize("USER", "COACH"),
    validate(getPostByIdSchema),
    postController.getPostByIdController,
  );

  postRoute.put(
    "/:postId",
    auth,
    authorize("USER", "COACH"),
    validate(updatePostSchema),
    postController.updatePostController,
  );

  postRoute.delete(
    "/:postId",
    auth,
    authorize("USER", "COACH"),
    validate(deletePostSchema),
    postController.deletePostController,
  );

  app.use("/user/posts", postRoute);
};

export default initPostRoute;