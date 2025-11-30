import authService from "../../services/employee/authService.js";

const handleLogin = async (req, res) => {
  const { username, password } = req.body;
  const data = await authService.handleLoginService(username, password);
  return res.status(200).json(data);
};

const getEmployeeAccount = async (req, res) => {
  return res.status(200).json(req.user);
};

const authController = {
  handleLogin,
  getEmployeeAccount,
};
export default authController;
