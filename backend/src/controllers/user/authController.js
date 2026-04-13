import dotenv from "dotenv";
import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import authService from "../../services/user/authService.js";
dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

const handleRegisterController = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  const user = await authService.handleRegisterService(data);
  return res
    .status(201)
    .json(
      new SuccessResponse(
        "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.",
        user,
      ),
    );
});

const verifyOtpController = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  await authService.verifyOtpService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Tài khoản đã xác thực thành công"));
});

const sendOtpController = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  await authService.sendOtpService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Mã OTP đã được gửi. Vui lòng kiểm tra email"));
});

const verifyResetOtpController = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  const resetToken = await authService.verifyResetOtpService(data);
  return res
    .status(200)
    .json(
      new SuccessResponse(
        "Token reset mật khẩu được gửi thành công",
        resetToken,
      ),
    );
});

const resetPasswordController = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  await authService.resetPasswordService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Tài khoản đã được đổi mật khẩu thành công"));
});

const refreshTokenController = asyncHandler(async (req, res) => {
  const data = { refreshToken: req.cookies.refreshToken || null };
  const result = await authService.refreshTokenService(data);
  const { accessToken, refreshToken } = result;
  return res
    .status(200)
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json(
      new SuccessResponse("Lấy access token mới thành công", { accessToken }),
    );
});

const handleLoginController = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  const result = await authService.handleLoginService(data);
  const { accessToken, refreshToken, user } = result;
  return res
    .status(200)
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json(
      new SuccessResponse("Đăng nhập thành công", {
        accessToken,
        user,
      }),
    );
});

const getAccountController = async (req, res) => {
  return res
    .status(200)
    .json(new SuccessResponse("Lấy thông tin người dùng thành công", req.user));
};

const logoutController = async (req, res) => {
  res.clearCookie("refreshToken");
  return res.status(200).json(new SuccessResponse("Đăng xuất thành công"));
};

const authController = {
  handleRegisterController,
  handleLoginController,
  verifyOtpController,
  sendOtpController,
  resetPasswordController,
  verifyResetOtpController,
  refreshTokenController,
  getAccountController,
  logoutController,
};

export default authController;
