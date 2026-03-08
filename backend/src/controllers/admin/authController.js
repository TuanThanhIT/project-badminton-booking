import authService from "../../services/admin/authService.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import SuccessResponse from "../../helpers/SuccessResponse.js";

const createAdminController = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  const safeAdmin = await authService.createAdminService(data);
  return res
    .status(201)
    .json(
      new SuccessResponse(
        "Tài khoản quản trị viên đã được tạo thành công! Vui lòng kiểm tra email để xác thực tài khoản.",
        safeAdmin,
      ),
    );
});

const handleLogin = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  const result = await authService.handleLoginService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Đăng nhập thành công", result));
});

const getAdminAccount = async (req, res) => {
  return res.status(200).json(req.user);
};

const authController = {
  createAdminController,
  handleLogin,
  getAdminAccount,
};
export default authController;
