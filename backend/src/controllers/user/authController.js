import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import authService from "../../services/user/authService.js";

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

const resetPasswordController = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  await authService.resetPasswordService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Tài khoản đã được đổi mật khẩu thành công"));
});

const sendOtpController = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  await authService.sendOtpService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Mã OTP đã được gửi. Vui lòng kiểm tra email"));
});

const handleLoginController = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  const result = await authService.handleLoginService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Đăng nhập thành công", result));
});

const getAccountController = async (req, res) => {
  return res
    .status(200)
    .json(new SuccessResponse("Lấy thông tin người dùng thành công", req.user));
};

const authController = {
  handleRegisterController,
  handleLoginController,
  verifyOtpController,
  sendOtpController,
  resetPasswordController,
  getAccountController,
};

export default authController;
