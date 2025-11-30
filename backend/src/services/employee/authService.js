import { Role, User } from "../../models/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ApiError from "../../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import dotenv from "dotenv";
dotenv.config();

const handleLoginService = async (username, password) => {
  try {
    const employee = await User.findOne({
      where: { username },
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["id", "roleName"],
        },
      ],
    });

    // Không tiết lộ tài khoản có tồn tại hay không
    if (!employee) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Thông tin đăng nhập không chính xác!"
      );
    }

    if (!employee.isVerified || !employee.isActive) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "Tài khoản hiện không thể đăng nhập. Vui lòng liên hệ hỗ trợ!"
      );
    }

    const isMatchPassword = await bcrypt.compare(password, employee.password);
    if (!isMatchPassword) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Thông tin đăng nhập không chính xác!"
      );
    }

    const payload = {
      id: employee.id,
      username: employee.username,
      email: employee.email,
      role: employee.role.roleName,
    };

    const access_token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    return {
      access_token,
      user: {
        id: employee.id,
        email: employee.email,
        username: employee.username,
        role: employee.role.roleName,
      },
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau!"
    );
  }
};

const authService = {
  handleLoginService,
};

export default authService;
