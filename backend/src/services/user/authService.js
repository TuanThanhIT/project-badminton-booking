import {
  Profile,
  Role,
  User,
  Wallet,
  UserOtp,
  RefreshToken,
  Branch,
} from "../../models/index.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import dotenv from "dotenv";
import mailer from "../../helpers/mailer.js";
import sequelize from "../../config/db.js";
import ConflictError from "../../errors/ConflictError.js";
import { Op } from "sequelize";
import BadRequestError from "../../errors/BadRequestError.js";
import NotFoundError from "../../errors/NotFoundError.js";
import { handleLogin } from "../shared/handleLogin.js";
import { OTP_TYPE } from "../../constants/userConstant.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.js";
import UnauthorizedError from "../../errors/UnauthorizedError.js";
import { WALLET_STATUS } from "../../constants/paymentConstant.js";
import { getEmployeeBranchIds } from "../employee/branchAccessService.js";
import { ROLE_NAME } from "../../constants/userConstant.js";

// Bước tiếp theo nâng cấp lên để tránh spam gửi OTP

dotenv.config();

const saltRounds = 10;

const handleRegisterService = async (data) => {
  const { username, email, password } = data;

  const hashPassword = await bcrypt.hash(password, saltRounds);

  return sequelize.transaction(async (t) => {
    const existingUser = await User.findOne({
      where: { username },
      transaction: t,
    });
    if (existingUser) throw new ConflictError("Tên đăng nhập đã tồn tại");

    const existingEmail = await User.findOne({
      where: { email },
      transaction: t,
    });
    if (existingEmail) throw new ConflictError("Email đã được sử dụng");

    const user = await User.create(
      { username, email, password: hashPassword, roleId: 2 },
      { transaction: t },
    );

    await Profile.create({ userId: user.id }, { transaction: t });

    const otpCode = crypto.randomInt(100000, 999999).toString();
    const otpHash = crypto.createHash("sha256").update(otpCode).digest("hex");
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    await UserOtp.create(
      {
        userId: user.id,
        otpCode: otpHash,
        otpExpiry,
        type: OTP_TYPE.REGISTER,
        attempts: 0,
        isUsed: false,
      },
      { transaction: t },
    );

    await Wallet.create(
      {
        userId: user.id,
        status: WALLET_STATUS.ACTIVE,
      },
      { transaction: t },
    );

    t.afterCommit(() =>
      mailer
        .sendOtpMail(email, otpCode, "Mã OTP xác thực tài khoản")
        .catch((err) => console.error("Send OTP email failed", err)),
    );

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      roleId: user.roleId,
      isVerified: user.isVerified,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  });
};

const verifyOtpService = async (data) => {
  const { email, otpCode } = data;

  const user = await User.findOne({ where: { email } });
  if (!user) throw new NotFoundError("Người dùng không tồn tại");

  const otpCodeHash = crypto.createHash("sha256").update(otpCode).digest("hex");

  const userOtp = await UserOtp.findOne({
    where: {
      userId: user.id,
      type: OTP_TYPE.REGISTER,
      isUsed: false,
    },
    order: [["createdAt", "DESC"]],
  });

  if (!userOtp) throw new BadRequestError("OTP không tồn tại hoặc ko hợp lệ");

  if (userOtp.otpExpiry < new Date()) {
    throw new BadRequestError("OTP hết hạn");
  }

  // Sai OTP
  if (userOtp.otpCode !== otpCodeHash) {
    await UserOtp.update(
      {
        attempts: sequelize.literal("attempts + 1"),
        isUsed: sequelize.literal(
          "CASE WHEN attempts + 1 >= 5 THEN true ELSE isUsed END",
        ),
      },
      { where: { id: userOtp.id } },
    );

    throw new BadRequestError("OTP không đúng");
  }

  // verify trước
  await userOtp.update({ isVerified: true });

  return sequelize.transaction(async (t) => {
    const otp = await UserOtp.findOne({
      where: {
        id: userOtp.id,
        isVerified: true,
        isUsed: false,
      },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!otp) throw new BadRequestError("OTP không hợp lệ");

    await user.update({ isVerified: true }, { transaction: t });
    await otp.update({ isUsed: true }, { transaction: t });
  });
};

const sendOtpService = async (data) => {
  const { email, type } = data;

  return sequelize.transaction(async (t) => {
    const user = await User.findOne({
      where: { email },
      transaction: t,
    });

    if (!user) {
      throw new BadRequestError("Thông tin xác thực không hợp lệ");
    }

    // check flow
    if (user.isVerified && type === OTP_TYPE.REGISTER) {
      throw new BadRequestError("Tài khoản đã được xác thực");
    }

    if (
      !user.isVerified &&
      (type === OTP_TYPE.WITHDRAW_REQUEST ||
        type === OTP_TYPE.RESET_PASSWORD ||
        type === OTP_TYPE.WALLET_PAYMENT)
    ) {
      throw BadRequestError("Tài khoản chưa được xác thực");
    }

    // chống spam + trả remainingTime
    const lastOtp = await UserOtp.findOne({
      where: { userId: user.id, type },
      order: [["createdAt", "DESC"]],
      transaction: t,
    });

    if (lastOtp) {
      const diff = Date.now() - new Date(lastOtp.createdAt).getTime();
      const cooldown = 60 * 1000;

      if (diff < cooldown) {
        const remainingTime = Math.ceil((cooldown - diff) / 1000);

        throw new BadRequestError("Vui lòng đợi trước khi yêu cầu OTP mới", {
          remainingTime,
        });
      }
    }

    // disable OTP cũ
    await UserOtp.update(
      { isUsed: true },
      {
        where: {
          userId: user.id,
          type,
          isUsed: false,
        },
        transaction: t,
      },
    );

    // tạo OTP mới
    const otpCode = crypto.randomInt(100000, 999999).toString();
    const otpHash = crypto.createHash("sha256").update(otpCode).digest("hex");
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    await UserOtp.create(
      {
        userId: user.id,
        otpCode: otpHash,
        otpExpiry,
        type,
        isUsed: false,
        attempts: 0,
      },
      { transaction: t },
    );

    t.afterCommit(() =>
      mailer
        .sendOtpMail(email, otpCode, "Mã OTP xác thực")
        .catch((err) => console.error("Send OTP email failed", err)),
    );
  });
};

const verifyResetOtpService = async (data) => {
  const { email, otpCode } = data;

  const user = await User.findOne({ where: { email } });
  if (!user) throw new NotFoundError("Người dùng không tồn tại");

  const otpCodeHash = crypto.createHash("sha256").update(otpCode).digest("hex");

  const userOtp = await UserOtp.findOne({
    where: {
      userId: user.id,
      type: OTP_TYPE.RESET_PASSWORD,
      isUsed: false,
    },
    order: [["createdAt", "DESC"]],
  });

  if (!userOtp)
    throw new BadRequestError("OTP không tồn tại hoặc không hợp lệ");

  if (userOtp.otpExpiry < new Date()) {
    throw new BadRequestError("OTP hết hạn");
  }

  // Sai OTP
  if (userOtp.otpCode !== otpCodeHash) {
    await UserOtp.update(
      {
        attempts: sequelize.literal("attempts + 1"),
        isUsed: sequelize.literal(
          "CASE WHEN attempts + 1 >= 5 THEN true ELSE isUsed END",
        ),
      },
      { where: { id: userOtp.id } },
    );

    throw new BadRequestError("OTP không đúng");
  }

  // verify trước
  await userOtp.update({ isVerified: true });

  return sequelize.transaction(async (t) => {
    const otp = await UserOtp.findOne({
      where: {
        id: userOtp.id,
        isVerified: true,
        isUsed: false,
      },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!otp) throw new BadRequestError("OTP không hợp lệ");

    // tạo resetToken
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await otp.update({
      isUsed: true,
      resetToken: resetTokenHash,
      resetTokenExpiry,
    });

    return { resetToken };
  });
};

const resetPasswordService = async (data) => {
  const { resetToken, newPassword } = data;

  return sequelize.transaction(async (t) => {
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const userOtp = await UserOtp.findOne({
      where: {
        resetToken: resetTokenHash,
        resetTokenExpiry: { [Op.gt]: new Date() },
      },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!userOtp) {
      throw new BadRequestError("Token không hợp lệ hoặc đã hết hạn");
    }

    const user = await User.findByPk(userOtp.userId, { transaction: t });

    const hashNewPassword = await bcrypt.hash(newPassword, saltRounds);

    await user.update({ password: hashNewPassword }, { transaction: t });

    // invalidate token
    await userOtp.update(
      {
        resetToken: null,
        resetTokenExpiry: null,
      },
      { transaction: t },
    );
  });
};

const refreshTokenService = async (data) => {
  const { refreshToken } = data;

  return sequelize.transaction(async (t) => {
    const saved = await RefreshToken.findOne({
      where: { token: refreshToken },
      transaction: t,
    });

    if (!saved) {
      throw new UnauthorizedError("Refresh token không tồn tại");
    }

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError("Refresh token không hợp lệ");
    }

    // xóa token cũ (QUAN TRỌNG)
    await saved.destroy();

    const user = await User.findByPk(payload.id, {
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

    const newAccessToken = generateAccessToken(payloadAccessToken);

    const payloadRefreshToken = {
      id: user.id,
    };

    const newRefreshToken = generateRefreshToken(payloadRefreshToken);

    await RefreshToken.create({
      token: newRefreshToken,
      userId: user.id,
      expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  });
};

const handleLoginService = async (data) => {
  const { username, password } = data;
  return handleLogin(username, password, ROLE_NAME.USER);
};

const handleAdminLoginService = async (data) => {
  const { username, password } = data;
  return handleLogin(username, password, ROLE_NAME.ADMIN);
};

const handleManagerLoginService = async (data) => {
  const { username, password } = data;
  return handleLogin(username, password, ROLE_NAME.MANAGER);
};

const handleEmployeeLoginService = async (data) => {
  const { username, password } = data;
  return handleLogin(username, password, ROLE_NAME.EMPLOYEE);
};

const authService = {
  handleRegisterService,
  handleLoginService,
  handleAdminLoginService,
  handleManagerLoginService,
  handleEmployeeLoginService,
  verifyOtpService,
  sendOtpService,
  verifyResetOtpService,
  resetPasswordService,
  refreshTokenService,
};

export default authService;
