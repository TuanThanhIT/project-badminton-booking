import dotenv from "dotenv";
import { ACCOUNT_STATUS } from "../constants/moderationConstant.js";
import ForbiddenError from "../errors/ForbiddenError.js";
import UnauthorizedError from "../errors/UnauthorizedError.js";
import { User } from "../models/index.js";
import { reactivateUserIfSuspensionExpired } from "../services/moderationViolationService.js";
import { verifyAccessToken } from "../utils/jwt.js";

dotenv.config();

const buildAccountLockData = (user) => ({
  accountStatus: user.accountStatus,
  forceLogout: true,
  suspendedUntil: user.suspendedUntil,
  suspensionReason: user.suspensionReason,
  violationCount: user.violationCount,
});

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return next(
        new UnauthorizedError(
          "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
        ),
      );
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);

    const user = await User.findByPk(decoded?.id, {
      attributes: [
        "id",
        "username",
        "email",
        "isVerified",
        "isActive",
        "accountStatus",
        "suspendedUntil",
        "suspensionReason",
        "violationCount",
      ],
    });

    if (!user || !user.isVerified || !user.isActive) {
      return next(new UnauthorizedError("Tài khoản hiện không thể sử dụng."));
    }

    await reactivateUserIfSuspensionExpired(user);

    if (user.accountStatus === ACCOUNT_STATUS.BANNED) {
      return next(
        new ForbiddenError(
          "Tài khoản của bạn đã bị khóa do vi phạm quy định cộng đồng.",
          buildAccountLockData(user),
        ),
      );
    }

    const suspensionIsActive =
      user.accountStatus === ACCOUNT_STATUS.SUSPENDED &&
      user.suspendedUntil &&
      new Date(user.suspendedUntil).getTime() > Date.now();

    if (suspensionIsActive) {
      return next(
        new ForbiddenError(
          "Tài khoản của bạn đang bị tạm khóa do vi phạm quy định cộng đồng.",
          buildAccountLockData(user),
        ),
      );
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: decoded?.role,
      branchIds: decoded?.branchIds || [],
    };

    return next();
  } catch (error) {
    if (error?.statusCode) {
      return next(error);
    }

    return next(
      new UnauthorizedError(
        "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
      ),
    );
  }
};

export default auth;
