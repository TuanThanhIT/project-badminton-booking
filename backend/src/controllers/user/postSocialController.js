import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import postSocialService from "../../services/user/postSocialService.js";

const toggleLikeController = asyncHandler(async (req, res) => {
  const data = { User: req.user, postId: req.params.postId, ...req.body };
  const result = await postSocialService.toggleLikeService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Thích thành công", result));
});

const createCommentController = asyncHandler(async (req, res) => {
  const data = {
    User: req.user,
    userId: req.user.id,
    postId: req.params.postId,
    ...req.body,
  };
  const result = await postSocialService.createCommentService(data);
  return res
    .status(201)
    .json(new SuccessResponse("Bình luận thành công", result));
});

const getCommentsController = asyncHandler(async (req, res) => {
  const data = { postId: req.params.postId, ...req.query };
  const result = await postSocialService.getCommentsService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Lấy bình luận thành công", result));
});

const deleteCommentController = asyncHandler(async (req, res) => {
  const data = {
    User: req.user,
    userId: req.user.id,
    commentId: req.params.commentId,
  };
  const result = await postSocialService.deleteCommentService(data);
  return res
    .status(200)
    .json(new SuccessResponse("ÄÃ£ gá»¡ bÃ¬nh luáº­n.", result));
});

const createRepostController = asyncHandler(async (req, res) => {
  const data = { User: req.user, postId: req.params.postId, ...req.body };
  const result = await postSocialService.createRepostService(data);
  return res
    .status(201)
    .json(new SuccessResponse("Chia sẻ thành công", result));
});

const reportCommentController = asyncHandler(async (req, res) => {
  const data = {
    User: req.user,
    userId: req.user.id,
    commentId: req.params.commentId,
    ...req.body,
  };
  const result = await postSocialService.reportCommentService(data);
  return res
    .status(201)
    .json(
      new SuccessResponse(
        result.autoHidden
          ? "Đã báo cáo và tạm ẩn bình luận do có nhiều báo cáo."
          : "Đã gửi báo cáo bình luận.",
        result,
      ),
    );
});

const postSocialController = {
  toggleLikeController,
  createCommentController,
  getCommentsController,
  deleteCommentController,
  createRepostController,
  reportCommentController,
};

export default postSocialController;
