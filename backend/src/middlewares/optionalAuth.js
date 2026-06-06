import { verifyAccessToken } from "../utils/jwt.js";

/**
 * Gắn req.user nếu có Bearer token hợp lệ; không chặn khi thiếu token.
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = verifyAccessToken(token);
    req.user = {
      id: decoded?.id,
      username: decoded?.username,
      email: decoded?.email,
      role: decoded?.role,
      branchIds: decoded?.branchIds || [],
    };
    next();
  } catch {
    req.user = null;
    next();
  }
};

export default optionalAuth;
