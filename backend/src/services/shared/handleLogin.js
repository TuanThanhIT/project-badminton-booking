import { Role, User } from "../../models/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import sequelize from "../../config/db.js";
import BadRequestError from "../../errors/BadRequestError.js";
dotenv.config();

export const handleLogin = async (username, password) => {
  if (!username || !password) {
    throw new BadRequestError("Vui lòng nhập username và password.");
  }
  return sequelize.transaction(async (t) => {
    const user = await User.findOne({
      where: { username },
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["id", "roleName"],
        },
      ],
      transaction: t,
    });

    if (!user) {
      throw new BadRequestError("Thông tin đăng nhập không chính xác!");
    }

    if (!user.isVerified || !user.isActive) {
      throw new BadRequestError(
        "Tài khoản hiện không thể đăng nhập. Vui lòng liên hệ hỗ trợ!",
      );
    }

    const isMatchPassword = await bcrypt.compare(password, user.password);
    if (!isMatchPassword) {
      throw new BadRequestError("Thông tin đăng nhập không chính xác!");
    }

    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role.roleName,
    };

    const access_token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role.roleName,
      },
    };
  });
};
