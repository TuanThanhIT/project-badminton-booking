import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import UnauthorizedError from "../errors/UnauthorizedError.js";

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

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded?.id,
      username: decoded?.username,
      email: decoded?.email,
      role: decoded?.role,
    };

    next();
  } catch (err) {
    next(
      new UnauthorizedError(
        "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
      ),
    );
  }
};

export default auth;
