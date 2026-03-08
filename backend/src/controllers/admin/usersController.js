import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import userService from "../../services/admin/usersService.js";
import { StatusCodes } from "http-status-codes";

const createUser = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  const safeUser = await userService.createUserService(data);
  return res
    .status(201)
    .json(
      new SuccessResponse(
        "Tài khoản người dùng đã được tạo thành công",
        safeUser,
      ),
    );
});

const lockUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const data = { userId };
  const user = await userService.lockUserService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Khóa tài khoản người dùng thành công", user));
});

const unlockUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const data = { userId };
  const user = await userService.unlockUserService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Mở khóa tài khoản người dùng thành công", user));
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await userService.getAllUsersService();
  return res
    .status(StatusCodes.OK)
    .json(new SuccessResponse("Lấy danh sách người dùng thành công", users));
});

const getUsersByRole = asyncHandler(async (req, res) => {
  const { roleId } = req.params;
  const data = { roleId };
  const users = await userService.getUsersByRoleService(data);
  return res
    .status(StatusCodes.OK)
    .json(
      new SuccessResponse(
        "Lấy danh sách người dùng theo role thành công",
        users,
      ),
    );
});

const getAllEmployees = asyncHandler(async (req, res) => {
  const employees = await userService.getAllEmployeesService();
  res
    .status(StatusCodes.OK)
    .json(
      new SuccessResponse(
        "Lấy danh sách tất cả nhân viên thành công",
        employees,
      ),
    );
});

const usersController = {
  createUser,
  lockUser,
  unlockUser,
  getAllUsers,
  getUsersByRole,
  getAllEmployees,
};

export default usersController;
