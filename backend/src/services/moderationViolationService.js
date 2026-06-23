import { Op } from "sequelize";
import sequelize from "../config/db.js";
import { ACCOUNT_STATUS } from "../constants/moderationConstant.js";
import NotFoundError from "../errors/NotFoundError.js";
import { sendUserNotification } from "../helpers/notification.js";
import mailer from "../helpers/mailer.js";
import {
  RefreshToken,
  User,
  UserModerationViolation,
} from "../models/index.js";
import { emitAccountLocked } from "../socket/emitter.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const LOCKED_STATUSES = [
  ACCOUNT_STATUS.SUSPENDED,
  ACCOUNT_STATUS.BANNED,
];

const runWithTransaction = (transaction, callback) =>
  transaction ? callback(transaction) : sequelize.transaction(callback);

const runAfterCommit = (transaction, callback) => {
  if (transaction?.afterCommit) {
    transaction.afterCommit(callback);
    return;
  }

  callback();
};

const sendLockEmailSafely = (user) => {
  if (
    !user?.email ||
    ![ACCOUNT_STATUS.SUSPENDED, ACCOUNT_STATUS.BANNED].includes(
      user.accountStatus,
    )
  ) {
    return;
  }

  mailer
    .sendModerationAccountLockMail({
      email: user.email,
      username: user.username,
      accountStatus: user.accountStatus,
      violationCount: user.violationCount,
      suspensionReason: user.suspensionReason,
      suspendedUntil: user.suspendedUntil,
    })
    .catch((error) =>
      console.error("Send moderation account lock email failed:", error.message),
    );
};

const buildPenaltyResult = (previousStatus, user) => {
  const statusChanged = previousStatus !== user.accountStatus;
  const forceLogout =
    statusChanged &&
    !LOCKED_STATUSES.includes(previousStatus) &&
    LOCKED_STATUSES.includes(user.accountStatus);

  return {
    accountStatus: user.accountStatus,
    suspendedUntil: user.suspendedUntil,
    suspensionReason: user.suspensionReason,
    violationCount: Number(user.violationCount || 0),
    lastViolationAt: user.lastViolationAt || null,
    forceLogout,
    statusChanged,
  };
};

const emitAccountLockedSafely = (user, penalty) => {
  try {
    emitAccountLocked(user.id, {
      ...penalty,
      message:
        "Tài khoản của bạn đã bị khóa do vi phạm quy định cộng đồng.",
    });
  } catch (error) {
    console.error("Emit account lock failed:", error.message);
  }
};

const notifyPenaltyChange = async (previousStatus, user, transaction) => {
  if (!user || previousStatus === user.accountStatus) {
    return;
  }

  if (user.accountStatus === ACCOUNT_STATUS.WARNING) {
    await sendUserNotification(
      user.id,
      "ACCOUNT_VIOLATION_WARNING",
      "Cảnh báo vi phạm cộng đồng",
      `Tài khoản của bạn đã có ${user.violationCount || 0} lần vi phạm. Vui lòng tuân thủ quy định cộng đồng để tránh bị khóa tài khoản.`,
      { transaction },
    );
    return;
  }

  if (user.accountStatus === ACCOUNT_STATUS.SUSPENDED) {
    await sendUserNotification(
      user.id,
      "ACCOUNT_SUSPENDED",
      "Tài khoản bị khóa",
      "Tài khoản của bạn đã bị tạm khóa do vi phạm quy định cộng đồng. Vui lòng kiểm tra email để biết thêm chi tiết.",
      { transaction },
    );
    runAfterCommit(transaction, () => sendLockEmailSafely(user));
    return;
  }

  if (user.accountStatus === ACCOUNT_STATUS.BANNED) {
    await sendUserNotification(
      user.id,
      "ACCOUNT_BANNED",
      "Tài khoản bị khóa",
      "Tài khoản của bạn đã bị khóa do vi phạm quy định cộng đồng. Vui lòng kiểm tra email để biết thêm chi tiết.",
      { transaction },
    );
    runAfterCommit(transaction, () => sendLockEmailSafely(user));
  }
};

export const reactivateUserIfSuspensionExpired = async (
  userOrId,
  transaction,
) => {
  const user =
    typeof userOrId === "object" && userOrId !== null
      ? userOrId
      : await User.findByPk(userOrId, {
          transaction,
          lock: transaction ? transaction.LOCK.UPDATE : undefined,
        });

  if (!user) {
    throw new NotFoundError("Không tìm thấy người dùng.");
  }

  const suspensionExpired =
    user.accountStatus === ACCOUNT_STATUS.SUSPENDED &&
    user.suspendedUntil &&
    new Date(user.suspendedUntil).getTime() <= Date.now();

  if (suspensionExpired) {
    await user.update(
      {
        accountStatus: ACCOUNT_STATUS.ACTIVE,
        suspendedUntil: null,
        suspensionReason: null,
      },
      { transaction },
    );
  }

  return user;
};

export const updateUserViolationStatus = async (userId, transaction) =>
  runWithTransaction(transaction, async (t) => {
    const [violationCount, latestViolation] = await Promise.all([
      UserModerationViolation.count({
        where: { userId },
        transaction: t,
      }),
      UserModerationViolation.findOne({
        where: { userId },
        order: [["createdAt", "DESC"]],
        transaction: t,
      }),
    ]);

    await User.update(
      {
        violationCount,
        lastViolationAt: latestViolation?.createdAt || null,
      },
      {
        where: { id: userId },
        transaction: t,
      },
    );

    return {
      violationCount,
      lastViolationAt: latestViolation?.createdAt || null,
    };
  });

export const checkAndApplyAccountPenalty = async (userId, transaction) =>
  runWithTransaction(transaction, async (t) => {
    let user = await User.findByPk(userId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!user) {
      throw new NotFoundError("Không tìm thấy người dùng.");
    }

    user = await reactivateUserIfSuspensionExpired(user, t);

    if (user.accountStatus === ACCOUNT_STATUS.BANNED) {
      return user;
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * DAY_MS);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * DAY_MS);

    const [violationsIn7Days, violationsIn30Days] = await Promise.all([
      UserModerationViolation.count({
        where: {
          userId,
          createdAt: { [Op.gte]: sevenDaysAgo },
        },
        transaction: t,
      }),
      UserModerationViolation.count({
        where: {
          userId,
          createdAt: { [Op.gte]: thirtyDaysAgo },
        },
        transaction: t,
      }),
    ]);

    const currentSuspensionIsActive =
      user.accountStatus === ACCOUNT_STATUS.SUSPENDED &&
      user.suspendedUntil &&
      new Date(user.suspendedUntil).getTime() > now.getTime();

    if (violationsIn30Days >= 5) {
      const proposedUntil = new Date(now.getTime() + 7 * DAY_MS);
      const suspendedUntil =
        currentSuspensionIsActive &&
        new Date(user.suspendedUntil).getTime() > proposedUntil.getTime()
          ? user.suspendedUntil
          : proposedUntil;

      await user.update(
        {
          accountStatus: ACCOUNT_STATUS.SUSPENDED,
          suspendedUntil,
          suspensionReason:
            "Tài khoản tái phạm nhiều lần trong vòng 30 ngày.",
        },
        { transaction: t },
      );
      return user;
    }

    if (violationsIn7Days >= 3) {
      const proposedUntil = new Date(now.getTime() + DAY_MS);
      const suspendedUntil =
        currentSuspensionIsActive &&
        new Date(user.suspendedUntil).getTime() > proposedUntil.getTime()
          ? user.suspendedUntil
          : proposedUntil;

      await user.update(
        {
          accountStatus: ACCOUNT_STATUS.SUSPENDED,
          suspendedUntil,
          suspensionReason:
            "Tài khoản có nhiều bài viết vi phạm quy định cộng đồng.",
        },
        { transaction: t },
      );
      return user;
    }

    if (currentSuspensionIsActive) {
      return user;
    }

    if (violationsIn7Days >= 2) {
      await user.update(
        {
          accountStatus: ACCOUNT_STATUS.WARNING,
          suspendedUntil: null,
          suspensionReason: null,
        },
        { transaction: t },
      );
      return user;
    }

    if (user.accountStatus === ACCOUNT_STATUS.WARNING) {
      await user.update(
        {
          accountStatus: ACCOUNT_STATUS.ACTIVE,
          suspendedUntil: null,
          suspensionReason: null,
        },
        { transaction: t },
      );
    }

    return user;
  });

export const createViolation = async (data, { transaction } = {}) =>
  runWithTransaction(transaction, async (t) => {
    const user = await User.findByPk(data.userId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!user) {
      throw new NotFoundError("Không tìm thấy người dùng.");
    }

    const previousStatus = user.accountStatus;
    const violation = await UserModerationViolation.create(data, {
      transaction: t,
    });

    await updateUserViolationStatus(data.userId, t);
    const updatedUser = await checkAndApplyAccountPenalty(data.userId, t);
    await updatedUser.reload({ transaction: t });
    const penalty = buildPenaltyResult(previousStatus, updatedUser);

    if (penalty.forceLogout) {
      await RefreshToken.destroy({
        where: { userId: data.userId },
        transaction: t,
      });
      runAfterCommit(t, () => emitAccountLockedSafely(updatedUser, penalty));
    }

    await notifyPenaltyChange(previousStatus, updatedUser, t);

    return {
      violation,
      user: updatedUser,
      ...penalty,
    };
  });

export const getUserViolations = async ({
  userId,
  page = 1,
  limit = 20,
}) => {
  const normalizedPage = Number(page);
  const normalizedLimit = Number(limit);
  const offset = (normalizedPage - 1) * normalizedLimit;

  const { rows, count } =
    await UserModerationViolation.findAndCountAll({
      where: { userId },
      include: [
        {
          model: User,
          as: "user",
          attributes: [
            "id",
            "username",
            "accountStatus",
            "violationCount",
          ],
        },
      ],
      limit: normalizedLimit,
      offset,
      order: [["createdAt", "DESC"]],
    });

  return {
    violations: rows,
    pagination: {
      page: normalizedPage,
      limit: normalizedLimit,
      total: count,
    },
  };
};
