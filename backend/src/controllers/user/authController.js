import dotenv from "dotenv";
import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import authService from "../../services/user/authService.js";
dotenv.config();

const clientUrl = process.env.CLIENT_URL || "";
const isHttpsClient = clientUrl.startsWith("https://");

const refreshTokenCookieBaseOptions = {
  httpOnly: true,
  secure: isHttpsClient,
  sameSite: isHttpsClient ? "none" : "lax",
};

const refreshTokenCookieOptions = {
  ...refreshTokenCookieBaseOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

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
    .cookie("refreshToken", refreshToken, refreshTokenCookieOptions)
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
    .cookie("refreshToken", refreshToken, refreshTokenCookieOptions)
    .json(
      new SuccessResponse("Đăng nhập thành công", {
        accessToken,
        user,
      }),
    );
});

const handleAdminLoginController = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  const result = await authService.handleAdminLoginService(data);
  const { accessToken, refreshToken, user } = result;
  return res
    .status(200)
    .cookie("refreshToken", refreshToken, refreshTokenCookieOptions)
    .json(
      new SuccessResponse("ÄÄƒng nháº­p Admin thÃ nh cÃ´ng", {
        accessToken,
        user,
      }),
    );
});

const handleManagerLoginController = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  const result = await authService.handleManagerLoginService(data);
  const { accessToken, refreshToken, user } = result;
  return res
    .status(200)
    .cookie("refreshToken", refreshToken, refreshTokenCookieOptions)
    .json(
      new SuccessResponse("ÄÄƒng nháº­p Quáº£n lÃ½ thÃ nh cÃ´ng", {
        accessToken,
        user,
      }),
    );
});

const handleEmployeeLoginController = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  const result = await authService.handleEmployeeLoginService(data);
  const { accessToken, refreshToken, user } = result;
  return res
    .status(200)
    .cookie("refreshToken", refreshToken, refreshTokenCookieOptions)
    .json(
      new SuccessResponse("ÄÄƒng nháº­p NhÃ¢n viÃªn thÃ nh cÃ´ng", {
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
  res.clearCookie("refreshToken", refreshTokenCookieBaseOptions);
  return res.status(200).json(new SuccessResponse("Đăng xuất thành công"));
};

const authController = {
  handleRegisterController,
  handleLoginController,
  handleAdminLoginController,
  handleManagerLoginController,
  handleEmployeeLoginController,
  verifyOtpController,
  sendOtpController,
  resetPasswordController,
  verifyResetOtpController,
  refreshTokenController,
  getAccountController,
  logoutController,
};

export default authController;
