import { Profile, Role, User } from "../../models/index.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import dotenv from "dotenv";
import UserOtp from "../../models/userOtp.js";
import mailer from "../../helpers/mailer.js";
import sequelize from "../../config/db.js";
import ConflictError from "../../errors/ConflictError.js";
import { Op } from "sequelize";
import BadRequestError from "../../errors/BadRequestError.js";
import { handleLogin } from "../shared/handleLogin.js";

// Bước tiếp theo nâng cấp lên để tránh spam gửi OTP

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
    const otpHash = crypto.createHash("sha256").update(otpCode).digest("hex");
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    await UserOtp.create(
      { userId: user.id, otpCode: otpHash, otpExpiry },
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

const verifyOtpService = async (data) => {
  const { email, otpCode } = data;
  return sequelize.transaction(async (t) => {
    const user = await User.findOne({
      where: { email },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!user) {
      throw new BadRequestError("Thông tin xác thực không hợp lệ!");
    }

    if (user.isVerified) {
      throw new BadRequestError("Tài khoản đã được xác thực!");
    }

    const otpCodeHash = crypto
      .createHash("sha256")
      .update(otpCode)
      .digest("hex");

    const userOtp = await UserOtp.findOne({
      where: {
        userId: user.id,
        otpCode: otpCodeHash,
        otpExpiry: { [Op.gt]: new Date() },
      },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!userOtp) {
      throw new BadRequestError("Mã xác thực không chính xác hoặc đã hết hạn!");
    }

    await user.update({ isVerified: true }, { transaction: t });
    await userOtp.destroy({ transaction: t });
  });
};

const sendVerifyOtpService = async (data) => {
  const { email } = data;
  return sequelize.transaction(async (t) => {
    const user = await User.findOne({
      where: { email },
      transaction: t,
    });

    if (!user) {
      throw new BadRequestError("Thông tin xác thực không hợp lệ!");
    }

    const otpCode = crypto.randomInt(100000, 999999).toString();
    const otpHash = crypto.createHash("sha256").update(otpCode).digest("hex");
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    await UserOtp.create(
      { userId: user.id, otpCode: otpHash, otpExpiry },
      { transaction: t },
    );

    t.afterCommit(() =>
      mailer
        .sendOtpMail(email, otpCode)
        .catch((err) => console.error("Send OTP email failed", err)),
    );
  });
};

const resetPasswordService = async (data) => {
  const { email, otpCode, newPassword } = data;
  const hashNewPassword = await bcrypt.hash(newPassword, saltRounds);

  return sequelize.transaction(async (t) => {
    const user = await User.findOne({
      where: { email },
      transaction: t,
    });
    if (!user) {
      throw new BadRequestError("Thông tin xác thực không hợp lệ!");
    }

    if (!user.isVerified) {
      throw new BadRequestError("Tài khoản chưa được xác thực!");
    }

    const otpCodeHash = crypto
      .createHash("sha256")
      .update(otpCode)
      .digest("hex");

    const userOtp = await UserOtp.findOne({
      where: {
        userId: user.id,
        otpCode: otpCodeHash,
        otpExpiry: { [Op.gt]: new Date() },
      },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!userOtp) {
      throw new BadRequestError("Mã xác thực không chính xác hoặc đã hết hạn!");
    }

    await user.update({ password: hashNewPassword }, { transaction: t });
    await userOtp.destroy({ transaction: t });
  });
};

const handleLoginService = async (data) => {
  const { username, password } = data;
  return handleLogin(username, password);
};

const authService = {
  createUserService,
  handleLoginService,
  verifyOtpService,
  sendVerifyOtpService,
  resetPasswordService,
};

export default authService;
