import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import { POST_MODERATION_STATUS } from "../../constants/moderationConstant.js";
import postService from "../../services/user/postService.js";

const createPostController = asyncHandler(async (req, res) => {
  const data = {
    userId: req.user.id,
    userRole: req.user.role,
    ...req.body,
  };

  const result = await postService.createPostService(data);
  const moderationStatus = result.moderation?.status;

  const messages = {
    [POST_MODERATION_STATUS.APPROVED]: "Tạo bài viết thành công.",
    [POST_MODERATION_STATUS.REVIEW_REQUIRED]:
      "Bài viết đã được ghi nhận và đang chờ quản trị viên duyệt.",
    [POST_MODERATION_STATUS.REJECTED]:
      "Bài viết đã được ghi nhận nhưng bị từ chối do vi phạm quy định cộng đồng.",
  };

  const statusCodes = {
    [POST_MODERATION_STATUS.APPROVED]: 201,
    [POST_MODERATION_STATUS.REVIEW_REQUIRED]: 202,
    [POST_MODERATION_STATUS.REJECTED]: 202,
  };

  return res
    .status(statusCodes[moderationStatus] || 201)
    .json(
      new SuccessResponse(
        messages[moderationStatus] || "Đã tiếp nhận bài viết.",
        result,
      ),
    );
});

const getPostsController = asyncHandler(async (req, res) => {
  const data = { userId: req.user.id, ...req.query };
  const result = await postService.getPostsService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Lấy danh sách bài đăng thành công", result));
});

const getPostByIdController = asyncHandler(async (req, res) => {
  const data = { userId: req.user.id, postId: req.params.postId };
  const post = await postService.getPostByIdService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Lấy chi tiết bài đăng thành công", post));
});

const updatePostController = asyncHandler(async (req, res) => {
  const data = {
    userId: req.user.id,
    ...req.body,
    postId: req.params.postId,
  };
  const post = await postService.updatePostService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Cập nhật bài đăng thành công", post));
});

const deletePostController = asyncHandler(async (req, res) => {
  const data = { userId: req.user.id, postId: req.params.postId };
  await postService.deletePostService(data);
  return res.status(200).json(new SuccessResponse("Đã xóa bài đăng"));
});

const postController = {
  createPostController,
  getPostsController,
  getPostByIdController,
  updatePostController,
  deletePostController,
};

export default postController;
