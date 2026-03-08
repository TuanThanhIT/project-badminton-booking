import dotenv from "dotenv";
import { handleLogin } from "../shared/handleLogin.js";
dotenv.config();

const handleLoginService = async (data) => {
  const { username, password } = data;
  handleLogin(username, password);
};

const authService = {
  handleLoginService,
};

export default authService;
