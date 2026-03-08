import { User, Profile, Role } from "../../models/index.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import sendOtpMail from "../../helpers/mailer.js";
import dotenv from "dotenv";
import sequelize from "../../config/db.js";
import ConflictError from "../../errors/ConflictError.js";
import { handleLogin } from "../shared/handleLogin.js";

dotenv.config();
const saltRounds = 10;

const createAdminService = async (data) => {
  const { username, email, password } = data;
  return sequelize.transaction(async (t) => {
    const existingUser = await User.findOne({
      where: { username },
      transaction: t,
    });
    if (existingUser) {
      throw new ConflictError(
        "Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác",
      );
    }
    const existingEmail = await User.findOne({
      where: { email },
      transaction: t,
    });
    if (existingEmail) {
      throw new ConflictError("Email đã được sử dụng cho tài khoản khác");
    }
    const hashPassword = await bcrypt.hash(password, saltRounds);
    const admin = await User.create(
      {
        username,
        email,
        password: hashPassword,
        roleId: 1,
      },
      { transaction: t },
    );
    await Profile.create(
      {
        userId: admin.id,
      },
      { transaction: t },
    );
    const otpCode = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await UserOtp.create(
      {
        otpCode,
        otpExpiry,
        userId: admin.id,
      },
      { transaction: t },
    );

    const safeAdmin = {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      isVerified: false,
      isActive: true,
      roleId: 1,
      createdDate: admin.createdDate,
      updatedDate: admin.updatedDate,
    };

    t.afterCommit(() => {
      sendOtpMail(email, otpCode).catch((err) =>
        console.error("Customer mail failed", err),
      );
    });

    return safeAdmin;
  });
};

const handleLoginService = async (data) => {
  const { username, password } = data;
  return handleLogin(username, password);
};

const authService = {
  createAdminService,
  handleLoginService,
};
export default authService;
