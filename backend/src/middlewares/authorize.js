import BadRequestError from "../errors/BadRequestError.js";
import UnauthorizedError from "../errors/UnauthorizedError.js";

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError("Vui lòng đăng nhập để tiếp tục"));
    }

    // Admin có quyền truy cập tất cả
    if (req.user.role === "Admin") {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new BadRequestError(
          "Tài khoản của bạn không hợp lệ. Bạn không có quyền truy cập.",
        ),
      );
    }

    next();
  };
};

export default authorize;
