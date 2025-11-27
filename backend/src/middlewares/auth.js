import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const auth = (req, res, next) => {
  if (req.headers && req.headers.authorization) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decoder = jwt.verify(token, process.env.JWT_SECRET);
      req.user = {
        id: decoder?.id,
        username: decoder?.username,
        email: decoder?.email,
        role: decoder?.role,
      };
      next();
    } catch (err) {
      return res.status(401).json({
        message: "Vui lòng đăng nhập để tiếp tục.",
      });
    }
  } else {
    return res.status(401).json({
      message:
        "Phiên đăng nhập của bạn đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.",
    });
  }
};

export default auth;
