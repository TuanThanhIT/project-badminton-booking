import { StatusCodes } from "http-status-codes";
import { User, Role } from "../../models/index.js";
import ApiError from "../../utils/ApiError.js";
import { Profile } from "../../models/index.js";
import bcrypt from "bcrypt";
import mailer from "../../utils/mailer.js";
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
      roleId: 3,
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
    await mailer.sendLockAccountMail(user.email, user.username);
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
    await mailer.sendUnlockAccountMail(user.email, user.username);
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
      attributes: [
        "id",
        "username",
        "password",
        "email",
        "isVerified",
        "isActive",
      ],
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["id", "roleName"],
        },
        {
          model: Profile,
          attributes: ["fullName", "dob", "gender", "address", "phoneNumber"],
        },
      ],
      order: [["createdDate", "DESC"]],
    });

    return users;
  } catch (error) {
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
const getAllEmployeesService = async () => {
  const employees = await User.findAll({
    where: {
      roleId: 3,
      isActive: true,
    },
    attributes: ["id", "username"],
    include: [
      {
        model: Profile,
        attributes: ["fullName"],
      },
    ],
    order: [["createdDate", "DESC"]],
  });

  return employees;
};

const userService = {
  createUser,
  lockUser,
  unlockUserService,
  getAllUsersService,
  getUsersByRoleService,
  getAllEmployeesService,
};
export default userService;
