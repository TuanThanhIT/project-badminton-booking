const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user)
      return res
        .status(401)
        .json({ message: "Vui lòng đăng nhập để tiếp tục." });

    // Admin có quyền truy cập tất cả
    if (req.user.role === "ADMIN") return next();

    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({
          message:
            "Tài khoản của bạn không hợp lệ. Bạn không có quyền truy cập.",
        });
    }

    next();
  };
};

export default authorize;
