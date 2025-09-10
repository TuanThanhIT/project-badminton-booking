import authService from "../../services/customer/authService.js";

const createUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const { user, userOtp } = await authService.createUserService(
      username,
      email,
      password
    );
    return res.status(201).json({ user, userOtp });
  } catch (error) {
    next(error);
  }
};

const verifyUserOtp = async (req, res, next) => {
  try {
    const { email, otpCode } = req.body;
    const { user, userOtp } = await authService.verifyOtpService(
      email,
      otpCode
    );
    return res.status(200).json({ user, userOtp });
  } catch (error) {
    next(error);
  }
};

const sentVerifyUserOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const userOtp = await authService.sentVerifyOtpService(email);
    return res.status(201).json(userOtp);
  } catch (error) {
    next(error);
  }
};

const userLogin = async (req, res) => {
  const { username, password } = req.body;
  const data = await authService.handleLoginService(username, password);
  return res.status(200).json(data);
};

const authController = {
  createUser,
  userLogin,
  verifyUserOtp,
  sentVerifyUserOtp,
};
export default authController;
