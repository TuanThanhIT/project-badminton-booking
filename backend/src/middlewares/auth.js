import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const auth = (req, res, next) => {
  const white_list = [
    "/login",
    "/register",
    "/abc",
    "/verify-otp",
    "/sent-otp",
  ];
  if (white_list.find((item) => "/customer" + item === req.originalUrl)) {
    next();
  } else {
    if (req.headers && req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoder = jwt.verify(token, process.env.JWT_SECRET);
        console.log(`check token: ${decoder}`);
        next();
      } catch (err) {
        return res.status(401).json({
          message: "Token hết hạn/ hoặc không hợp lệ ",
        });
      }
    } else {
      return res.status(401).json({
        message:
          "Bạn chưa truyền Access Token ở headers/ hoặc Access Token hết hạn ",
      });
    }
  }
};
export default auth;
