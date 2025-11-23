import { User, Profile } from "../../models/index.js";
import ApiError from "../../utils/ApiError.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import sendOtpMail from "../../utils/mailer.js";
dotenv.config();
const saltRounds = 10;
const createAdminService = async (username, email, password) => {
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
    const hashPassword = await bcrypt.hash(password, saltRounds);
    const admin = await User.create({
      username,
      email,
      password: hashPassword,
      roleId: 1,
    });
    await Profile.create({
      userId: admin.id,
    });
    const otpCode = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await UserOtp.create({
      otpCode,
      otpExpiry,
      userId: admin.id,
    });
    sendOtpMail(email, otpCode);
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
    return safeAdmin;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Đã xảy ra lỗi khi tạo tài khoản. Vui lòng thử lại sau!"
    );
  }
};
const authService = {
  createAdminService,
};
export default authService;
