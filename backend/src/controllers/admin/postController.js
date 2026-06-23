import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import adminPostService from "../../services/admin/postService.js";

const getPostsController = asyncHandler(async (req, res) => {
  const result = await adminPostService.getAdminPostsService(req.query);
  return res
    .status(200)
    .json(
      new SuccessResponse(
        "Lấy danh sách bài đăng thành công",
        result,
      ),
    );
});

const togglePostActiveController = asyncHandler(async (req, res) => {
  const result =
    await adminPostService.toggleAdminPostActiveService(
      req.params.postId,
    );
  return res
    .status(200)
    .json(
      new SuccessResponse(
        result.isActive
          ? "Đã mở khóa bài đăng"
          : "Đã khóa bài đăng",
        result,
      ),
    );
});

const deletePostController = asyncHandler(async (req, res) => {
  const result = await adminPostService.deleteAdminPostService(
    req.params.postId,
  );
  return res
    .status(200)
    .json(
      new SuccessResponse("Xóa bài đăng thành công", result),
    );
});

const getCommentsController = asyncHandler(async (req, res) => {
  const result =
    await adminPostService.getAdminCommentsService(req.query);
  return res
    .status(200)
    .json(
      new SuccessResponse(
        "Lấy danh sách bình luận thành công",
        result,
      ),
    );
});

const deleteCommentController = asyncHandler(async (req, res) => {
  const result = await adminPostService.deleteAdminCommentService(
    req.params.commentId,
  );
  return res
    .status(200)
    .json(
      new SuccessResponse("Xóa bình luận thành công", result),
    );
});

const getPendingModerationPostsController = asyncHandler(
  async (req, res) => {
    const result =
      await adminPostService.getPendingModerationPostsService(
        req.query,
      );
    return res
      .status(200)
      .json(
        new SuccessResponse(
          "Lấy danh sách bài viết chờ duyệt thành công",
          result,
        ),
      );
  },
);

const getPostModerationDetailController = asyncHandler(
  async (req, res) => {
    const result =
      await adminPostService.getPostModerationDetailService(
        req.params.postId,
      );
    return res
      .status(200)
      .json(
        new SuccessResponse(
          "Lấy thông tin kiểm duyệt thành công",
          result,
        ),
      );
  },
);

const approveModerationPostController = asyncHandler(
  async (req, res) => {
    const result =
      await adminPostService.approveModerationPostService(
        req.params.postId,
        req.body,
      );
    return res
      .status(200)
      .json(
        new SuccessResponse("Duyệt bài viết thành công", result),
      );
  },
);

const rejectModerationPostController = asyncHandler(
  async (req, res) => {
    const result =
      await adminPostService.rejectModerationPostService(
        req.params.postId,
        req.body,
      );
    return res
      .status(200)
      .json(
        new SuccessResponse("Từ chối bài viết thành công", result),
      );
  },
);

const adminPostController = {
  getPostsController,
  togglePostActiveController,
  deletePostController,
  getCommentsController,
  deleteCommentController,
  getPendingModerationPostsController,
  getPostModerationDetailController,
  approveModerationPostController,
  rejectModerationPostController,
};

export default adminPostController;
