import UnauthorizedError from "../errors/UnauthorizedError.js";
import ForbiddenError from "../errors/ForbiddenError.js";
import { ROLE_NAME } from "../constants/userConstant.js";

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError("Vui lòng đăng nhập để tiếp tục"));
    }

    // Admin có quyền truy cập tất cả
    if (req.user.role === ROLE_NAME.ADMIN) {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError("Bạn không có quyền truy cập chức năng này."),
      );
    }

    next();
  };
};

export default authorize;
