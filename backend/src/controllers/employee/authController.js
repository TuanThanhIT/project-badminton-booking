import asyncHandler from "../../middlewares/asyncHandler.js";
import authService from "../../services/employee/authService.js";

const handleLogin = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  const result = await authService.handleLoginService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Đăng nhập thành công", result));
});

const getEmployeeAccount = async (req, res) => {
  return res.status(200).json(new SuccessResponse("", req.user));
};

const authController = {
  handleLogin,
  getEmployeeAccount,
};
export default authController;
