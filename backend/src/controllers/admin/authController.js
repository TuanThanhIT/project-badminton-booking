import authService from "../../services/admin/authService.js";

const createAdminController = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    safeAdmin = await authService.createAdminService(username, email, password);
    return res.status(201).json({
      message:
        "Tài khoản quản trị viên đã được tạo thành công! Vui lòng kiểm tra email để xác thực tài khoản.",
      safeAdmin,
    });
  } catch (error) {
    next(error);
  }
};

const handleLogin = async (req, res) => {
  const { username, password } = req.body;
  const data = await authService.handleLoginService(username, password);
  return res.status(200).json(data);
};

const getAdminAccount = async (req, res) => {
  return res.status(200).json(req.user);
};

const authController = {
  createAdminController,
  handleLogin,
  getAdminAccount,
};
export default authController;
