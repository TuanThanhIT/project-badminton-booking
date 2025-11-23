import userSerVice from "../../services/admin/usersService";
const createUserController = async (req, res, next) => {
  try {
    const { username, password, email } = req.body;
    const safeUser = await userSerVice.createUser(username, password, email);
    return res.status(201).json({
      message: "Tài khoản người dùng đã được tạo thành công!",
      safeUser,
    });
  } catch (error) {
    next(error);
  }
};
const usersController = { createUserController };
export default usersController;
