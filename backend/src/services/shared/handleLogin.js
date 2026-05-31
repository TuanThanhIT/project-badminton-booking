import { Branch, Role, User } from "../../models/index.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import sequelize from "../../config/db.js";
import BadRequestError from "../../errors/BadRequestError.js";
import RefreshToken from "../../models/refreshToken.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt.js";
import { getEmployeeBranchIds } from "../employee/branchAccessService.js";
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
        {
          model: Branch,
          as: "employeeBranches",
          attributes: ["id", "branchName"],
          through: { attributes: [] },
          required: false,
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

    const branchIds =
      user.role.roleName === "EMPLOYEE"
        ? await getEmployeeBranchIds(user.id, t)
        : [];

    const payloadAccessToken = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role.roleName,
      branchIds,
    };

    const accessToken = generateAccessToken(payloadAccessToken);

    const payloadRefreshToken = {
      id: user.id,
    };

    const refreshToken = generateRefreshToken(payloadRefreshToken);

    // lưu DB
    await RefreshToken.create({
      token: refreshToken,
      userId: user.id,
      expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role.roleName,
        branchIds,
      },
    };
  });
};
