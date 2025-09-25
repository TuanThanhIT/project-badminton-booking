import authService from "../../services/customer/authService.js";

const createUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const { safeUser } = await authService.createUserService(
      username,
      email,
      password
    );
    return res.status(201).json({
      message:
        "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.",
      safeUser,
    });
  } catch (error) {
    next(error);
  }
};

const verifyUserOtp = async (req, res, next) => {
  try {
    const { email, otpCode } = req.body;
    await authService.verifyOtpService(email, otpCode);
    return res
      .status(200)
      .json({ message: "Tài khoản đã được xác thực thành công" });
  } catch (error) {
    next(error);
  }
};

const sentVerifyUserOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    await authService.sentVerifyOtpService(email);
    return res.status(201).json({
      message: "Mã OTP đã được gửi. Vui lòng kiểm tra email.",
    });
  } catch (error) {
    next(error);
  }
};

const userLogin = async (req, res) => {
  const { username, password } = req.body;
  const data = await authService.handleLoginService(username, password);
  return res.status(200).json(data);
};

const getAccount = async (req, res) => {
  return res.status(200).json(req.user);
};

const authController = {
  createUser,
  userLogin,
  verifyUserOtp,
  sentVerifyUserOtp,
  getAccount,
};
export default authController;
