import { StatusCodes } from "http-status-codes";
import { User, Role } from "../../models/index.js";
import ApiError from "../../utils/ApiError.js";
import bcrypt from "bcrypt";
const createUser = async (username, password, email) => {
  try {
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác!"
      );
    }
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Email đã được sử dụng cho tài khoản khác!"
      );
    }
    const saltRounds = 10;
    const hashPassword = await bcrypt.hash(password, saltRounds);
    const user = await User.create({
      username,
      email,
      password: hashPassword,
      roleId: 2,
    });
    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      isVerified: user.isVerified,
      isActive: user.isActive,
      roleId: user.roleId,
      createdDate: user.createdDate,
      updatedDate: user.updatedDate,
    };
    return safeUser;
  } catch (error) {
    console.error("ERROR IN createUser:", error);
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Đã xảy ra lỗi khi tạo tài khoản. Vui lòng thử lại sau!"
    );
  }
};
const lockUser = async (userId) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Người dùng không tồn tại!");
    }
    await user.update({ isActive: false });
    return {
      success: true,
      message: "Tài khoản đã bị khóa thành công!",
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Đã xảy ra lỗi khi chặn tài khoản. Vui lòng thử lại sau!"
    );
  }
};
const unlockUserService = async (userId) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "User không tồn tại!");
    }

    await user.update({ isActive: true });

    return {
      success: true,
      message: "Tài khoản đã được mở khóa thành công!",
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};
const getAllUsersService = async () => {
  try {
    const users = await User.findAll({
      include: [
        {
          model: Role,
          as: "role",

          attributes: ["id", "roleName"],
        },
      ],
      order: [["createdDate", "DESC"]],
    });

    return users;
  } catch (error) {
    console.error("ERROR getAllUsers:", error);

    if (error instanceof ApiError) throw error;
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};
const getUsersByRoleService = async (roleId) => {
  try {
    const users = await User.findAll({
      where: { roleId },
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["id", "roleName"],
        },
      ],
    });

    return users;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const userService = {
  createUser,
  lockUser,
  unlockUserService,
  getAllUsersService,
  getUsersByRoleService,
};
export default userService;
