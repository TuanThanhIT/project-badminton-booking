import dotenv from "dotenv";
import UnauthorizedError from "../errors/UnauthorizedError.js";
import { verifyAccessToken } from "../utils/jwt.js";

dotenv.config();

const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      next(
        new UnauthorizedError(
          "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
        ),
      );
    }

    const token = authHeader.split(" ")[1];

    const decoded = verifyAccessToken(token);

    req.user = {
      id: decoded?.id,
      username: decoded?.username,
      email: decoded?.email,
      role: decoded?.role,
    };

    next();
  } catch (err) {
    console.log(err);
    next(
      new UnauthorizedError(
        "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
      ),
    );
  }
};

export default auth;
