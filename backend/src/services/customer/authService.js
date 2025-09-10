import { User } from "../../models/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { where } from "sequelize";
import ApiError from "../../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import dotenv from "dotenv";
import UserOtp from "../../models/userOtp.js";
import sendOtpMail from "../../utils/mailer.js";
dotenv.config();
const saltRounds = 10;

const createUserService = async (username, email, password) => {
  try {
    const existingUsername = await User.findOne({
      where: { username },
    });
    if (existingUsername) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Username đã tồn tại!");
    }

    const existingEmail = await User.findOne({
      where: { email },
    });
    if (existingEmail) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Email đã tồn tại!");
    }

    // hash user password
    const hashPassword = await bcrypt.hash(password, saltRounds);

    // save user password
    let user = await User.create({
      username,
      email,
      password: hashPassword,
      roleId: 2,
    });

    // tạo OTP
    const otpCode = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 phút

    const userOtp = await UserOtp.create({
      otpCode,
      otpExpiry,
      userId: user.id,
    });

    sendOtpMail(email, otpCode);

    return {
      user,
      userOtp,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const verifyOtpService = async (email, otpCode) => {
  try {
    const user = await User.findOne({
      where: { email },
    });
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "User không tồn tại");
    } else {
      const userOtp = await UserOtp.findOne({
        where: { userId: user.id },
        order: [["createdDate", "DESC"]],
      });
      if (userOtp.otpCode !== otpCode) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Otp không hợp lệ!");
      }
      if (userOtp.otpExpiry < new Date()) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Otp đã hết hạn!");
      }
      if (userOtp.isUsed === true) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Opt đã được sử dụng");
      }

      user.isVerified = true;
      user.save();

      userOtp.isUsed = true;
      userOtp.save;
      return {
        user,
        userOtp,
      };
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const sentVerifyOtpService = async (email) => {
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "User không tồn tại!");
    } else {
      // tạo OTP
      const otpCode = crypto.randomInt(100000, 999999).toString();
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 phút

      const userOtp = await UserOtp.create({
        otpCode,
        otpExpiry,
        userId: user.id,
      });

      sendOtpMail(email, otpCode);
      return userOtp;
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const handleLoginService = async (username, password) => {
  try {
    const user = await User.findOne({ where: { username } });
    if (user) {
      if (!user.isVerified || !user.isActive) {
        throw new ApiError(
          StatusCodes.FORBIDDEN,
          "Tài khoản của bạn hiện không thể đăng nhập!"
        );
      }
      const isMatchPassword = await bcrypt.compare(password, user.password);
      if (!isMatchPassword) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          "Email hoặc password không hợp lệ"
        );
      } else {
        const payload = {
          username: user.username,
          email: user.email,
        };
        const access_token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRE,
        });
        return {
          EC: 0,
          access_token,
          user: {
            email: user.email,
            username: user.username,
          },
        };
      }
    } else {
      throw new ApiError(StatusCodes.NOT_FOUND, "User không tồn tại");
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

// const getUserService = async () => {
//   try {
//     let result = await User.find().select("-password");
//     return result;
//   } catch (error) {
//     console.log(error);
//     return null;
//   }
// };

const authService = {
  createUserService,
  handleLoginService,
  verifyOtpService,
  sentVerifyOtpService,
};

export default authService;
