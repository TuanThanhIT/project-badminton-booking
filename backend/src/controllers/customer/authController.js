import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import authService from "../../services/customer/authService.js";

const createUser = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  const user = await authService.createUserService(data);
  return res
    .status(201)
    .json(
      new SuccessResponse(
        "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.",
        user,
      ),
    );
});

const verifyUserOtp = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  await authService.verifyOtpService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Tài khoản đã xác thực thành công"));
});

const resetPassword = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  await authService.resetPasswordService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Tài khoản đã được đổi mật khẩu thành công"));
});

const sendVerifyOtp = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  await authService.sendVerifyOtpService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Mã OTP đã được gửi. Vui lòng kiểm tra email"));
});

const handleLogin = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  const result = await authService.handleLoginService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Đăng nhập thành công", result));
});

const getAccount = async (req, res) => {
  return res
    .status(200)
    .json(new SuccessResponse("Lấy thông tin người dùng thành công", req.user));
};

const authController = {
  createUser,
  handleLogin,
  verifyUserOtp,
  sendVerifyOtp,
  resetPassword,
  getAccount,
};
export default authController;
