import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import userService from "../../services/admin/userService.js";

const getUsersController = asyncHandler(async (req, res) => {
  const data = { ...req.query };
  const result = await userService.getUsersService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Lấy danh sách người dùng thành công", result));
});

const getUserDetailController = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const result = await userService.getUserDetailService(userId);
  return res
    .status(200)
    .json(new SuccessResponse("Lấy chi tiết người dùng thành công", result));
});

const toggleUserActiveController = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const adminId = req.user.id;
  const result = await userService.toggleUserActiveService(userId, adminId);
  return res
    .status(200)
    .json(
      new SuccessResponse(
        result.isActive ? "Mở khóa tài khoản thành công" : "Khóa tài khoản thành công",
        result,
      ),
    );
});

const createManagerController = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  const result = await userService.createManagerService(data);
  return res
    .status(201)
    .json(new SuccessResponse("Tạo tài khoản Manager thành công", result));
});

const deleteManagerController = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const adminId = req.user.id;
  const result = await userService.deleteManagerService(userId, adminId);
  return res.status(200).json(new SuccessResponse("Xóa tài khoản thành công", result));
});

const adminUserController = {
  getUsersController,
  getUserDetailController,
  toggleUserActiveController,
  createManagerController,
  deleteManagerController,
};

export default adminUserController;
