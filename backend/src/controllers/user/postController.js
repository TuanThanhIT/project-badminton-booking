import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import postService from "../../services/user/postService.js";

// Tạo bài đăng mới (User/Coach). Riêng loại "Class" chỉ Coach được phép (check trong service).
const createPostController = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  const post = await postService.createPostService(data, req.user);
  return res
    .status(201)
    .json(new SuccessResponse("Đăng bài thành công", post));
});

// Lấy danh sách bài đăng (có phân trang + filter type).
const getPostsController = asyncHandler(async (req, res) => {
  const data = { ...req.query };
  const result = await postService.getPostsService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Lấy danh sách bài đăng thành công", result));
});

// Lấy chi tiết bài đăng theo id.
const getPostByIdController = asyncHandler(async (req, res) => {
  const data = { ...req.params };
  const post = await postService.getPostByIdService(Number(data.id));
  return res
    .status(200)
    .json(new SuccessResponse("Lấy chi tiết bài đăng thành công", post));
});

// Cập nhật bài đăng (chỉ tác giả mới được sửa).
const updatePostController = asyncHandler(async (req, res) => {
  const params = { ...req.params };
  const data = { ...req.body };

  const post = await postService.updatePostService(
    Number(params.id),
    data,
    req.user,
  );

  return res
    .status(200)
    .json(new SuccessResponse("Cập nhật bài đăng thành công", post));
});

// Xóa bài đăng (soft-delete, chỉ tác giả mới được xóa).
const deletePostController = asyncHandler(async (req, res) => {
  const params = { ...req.params };
  await postService.deletePostService(Number(params.id), req.user);
  return res
    .status(200)
    .json(new SuccessResponse("Đã xóa bài đăng"));
});

const postController = {
  createPostController,
  getPostsController,
  getPostByIdController,
  updatePostController,
  deletePostController,
};

export default postController;