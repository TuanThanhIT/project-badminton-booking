import userService from "../../services/admin/usersService.js";
import { StatusCodes } from "http-status-codes";
const createUserController = async (req, res, next) => {
  try {
    const { username, password, email } = req.body;
    const safeUser = await userService.createUser(username, password, email);
    return res.status(201).json({
      message: "Tài khoản người dùng đã được tạo thành công!",
      safeUser,
    });
  } catch (error) {
    next(error);
  }
};
const lockUserController = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const result = await userService.lockUser(userId);

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};
const unlockUserController = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const result = await userService.unlockUserService(userId);

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};
const getAllUsersController = async (req, res, next) => {
  try {
    const users = await userService.getAllUsersService();

    return res.status(StatusCodes.OK).json({
      message: "Lấy danh sách người dùng thành công!",
      users,
    });
  } catch (error) {
    next(error);
  }
};
const getUsersByRoleController = async (req, res, next) => {
  try {
    const { roleId } = req.params;
    const users = await userService.getUsersByRoleService(roleId);

    return res.status(StatusCodes.OK).json({
      message: `Danh sách user với roleId = ${roleId}`,
      users,
    });
  } catch (error) {
    next(error);
  }
};
const usersController = {
  createUserController,
  lockUserController,
  unlockUserController,
  getAllUsersController,
  getUsersByRoleController,
};

export default usersController;
