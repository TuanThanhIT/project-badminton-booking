import { Profile, Role, User } from "../../models/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import ApiError from "../../errors/ApiError.js";
import { StatusCodes } from "http-status-codes";
import dotenv from "dotenv";
import UserOtp from "../../models/userOtp.js";
import mailer from "../../helpers/mailer.js";
import sequelize from "../../config/db.js";
import ConflictError from "../../errors/ConflictError.js";

dotenv.config();

const saltRounds = 10;

const createUserService = async (data) => {
  const { username, email, password } = data;

  const hashPassword = await bcrypt.hash(password, saltRounds);

  return sequelize.transaction(async (t) => {
    const existingUser = await User.findOne({
      where: { username },
      transaction: t,
    });
    if (existingUser) throw new ConflictError("Tên đăng nhập đã tồn tại!");

    const existingEmail = await User.findOne({
      where: { email },
      transaction: t,
    });
    if (existingEmail) throw new ConflictError("Email đã được sử dụng!");

    const user = await User.create(
      { username, email, password: hashPassword, roleId: 2 },
      { transaction: t },
    );

    await Profile.create({ userId: user.id }, { transaction: t });

    const otpCode = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    await UserOtp.create(
      { userId: user.id, otpCode, otpExpiry },
      { transaction: t },
    );

    t.afterCommit(() =>
      mailer
        .sendOtpMail(email, otpCode)
        .catch((err) => console.error("Send OTP email failed", err)),
    );

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      roleId: user.roleId,
      isVerified: user.isVerified,
      isActive: user.isActive,
      createdDate: user.createdDate,
    };
  });
};

const verifyOtpService = async (email, otpCode, newPassword) => {
  let transaction;
  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email?.trim())) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Email không hợp lệ!");
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Thông tin xác thực không hợp lệ!",
      );
    }

    const userOtp = await UserOtp.findOne({
      where: { userId: user.id },
      order: [["createdDate", "DESC"]],
    });

    if (!userOtp || userOtp.otpCode !== otpCode) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Mã xác thực không chính xác!",
      );
    }

    if (userOtp.otpExpiry < new Date()) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Mã xác thực đã hết hạn. Vui lòng yêu cầu mã mới!",
      );
    }

    if (userOtp.isUsed === true) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Mã xác thực đã được sử dụng!",
      );
    }

    transaction = await sequelize.transaction();

    if (!newPassword) {
      user.isVerified = true;
    } else {
      const hashNewPassword = await bcrypt.hash(newPassword, saltRounds);
      user.password = hashNewPassword;
    }
    await user.save({ transaction });

    userOtp.isUsed = true;
    await userOtp.save({ transaction });

    await transaction.commit();
  } catch (error) {
    if (transaction) await transaction.rollback();
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Không thể xác thực mã OTP. Vui lòng thử lại sau!",
    );
  }
};

const sentVerifyOtpService = async (email) => {
  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email?.trim())) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Email không hợp lệ!");
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Không thể gửi mã xác thực. Vui lòng kiểm tra lại thông tin!",
      );
    }

    const otpCode = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    await UserOtp.create({
      otpCode,
      otpExpiry,
      userId: user.id,
    });

    try {
      await mailer.sendOtpMail(email, otpCode);
    } catch (mailErr) {
      console.error("Gửi OTP mail thất bại:", mailErr);
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Không thể gửi mã xác thực. Vui lòng thử lại sau!",
    );
  }
};

const handleLoginService = async (username, password) => {
  try {
    const user = await User.findOne({
      where: { username },
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["id", "roleName"],
        },
      ],
    });

    if (!user) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Thông tin đăng nhập không chính xác!",
      );
    }

    if (!user.isVerified || !user.isActive) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "Tài khoản hiện không thể đăng nhập. Vui lòng liên hệ hỗ trợ!",
      );
    }

    const isMatchPassword = await bcrypt.compare(password, user.password);
    if (!isMatchPassword) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Thông tin đăng nhập không chính xác!",
      );
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
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau!",
    );
  }
};

const authService = {
  createUserService,
  handleLoginService,
  verifyOtpService,
  sentVerifyOtpService,
};

export default authService;
