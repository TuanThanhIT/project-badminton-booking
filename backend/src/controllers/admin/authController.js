import authService from "../../services/admin/authService";
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
const authController = {
  createAdminController,
};
export default authController;
