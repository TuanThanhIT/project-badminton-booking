import { Op } from "sequelize";
import sequelize from "../../config/db.js";
import { WalletTransaction, WithdrawRequest, Wallet, User, Profile } from "../../models/index.js";
import {
  WALLET_TRANSACTION_STATUS,
  WALLET_TRANSACTION_TYPE,
  WALLET_STATUS,
  WITHDRAW_REQUEST_STATUS,
} from "../../constants/paymentConstant.js";
import NotFoundError from "../../errors/NotFoundError.js";
import BadRequestError from "../../errors/BadRequestError.js";

const getAdminWalletTransactionsService = async (data) => {
  const { page = 1, limit = 15, type, status, dateFrom, dateTo } = data;
  const offset = (page - 1) * limit;

  const where = {};
  if (type) where.type = type;
  if (status) where.status = status;
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt[Op.gte] = new Date(dateFrom);
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      where.createdAt[Op.lte] = end;
    }
  }

  const { rows, count } = await WalletTransaction.findAndCountAll({
    where,
    attributes: ["id", "walletId", "amount", "type", "status", "description", "createdAt"],
    include: [
      {
        model: Wallet,
        as: "wallet",
        attributes: ["id", "userId", "balance"],
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "username", "email"],
            include: [{ model: Profile, as: "profile", attributes: ["fullName", "avatar"] }],
          },
        ],
      },
    ],
    limit: Number(limit),
    offset: Number(offset),
    order: [["createdAt", "DESC"]],
    distinct: true,
  });

  const transactions = rows.map((t) => {
    const tx = t.toJSON();
    return {
      id: tx.id,
      amount: Number(tx.amount),
      type: tx.type,
      status: tx.status,
      description: tx.description,
      createdAt: tx.createdAt,
      walletId: tx.walletId,
      walletBalance: Number(tx.wallet?.balance || 0),
      userId: tx.wallet?.userId,
      username: tx.wallet?.user?.username,
      email: tx.wallet?.user?.email,
      fullName: tx.wallet?.user?.profile?.fullName,
      avatar: tx.wallet?.user?.profile?.avatar,
    };
  });

  return { transactions, pagination: { page: Number(page), limit: Number(limit), total: count } };
};

const getAdminWithdrawRequestsService = async (data) => {
  const { page = 1, limit = 15, status } = data;
  const offset = (page - 1) * limit;

  const where = {};
  if (status) where.status = status;

  const { rows, count } = await WithdrawRequest.findAndCountAll({
    where,
    attributes: ["id", "walletId", "amount", "bankName", "bankAccount", "accountHolder", "status", "processedAt", "createdAt"],
    include: [
      {
        model: Wallet,
        as: "wallet",
        attributes: ["id", "userId", "balance"],
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "username", "email"],
            include: [{ model: Profile, as: "profile", attributes: ["fullName", "avatar"] }],
          },
        ],
      },
    ],
    limit: Number(limit),
    offset: Number(offset),
    order: [["createdAt", "DESC"]],
    distinct: true,
  });

  const requests = rows.map((r) => {
    const req = r.toJSON();
    return {
      id: req.id,
      amount: Number(req.amount),
      bankName: req.bankName,
      bankAccount: req.bankAccount,
      accountHolder: req.accountHolder,
      status: req.status,
      processedAt: req.processedAt,
      createdAt: req.createdAt,
      walletId: req.walletId,
      walletBalance: Number(req.wallet?.balance || 0),
      userId: req.wallet?.userId,
      username: req.wallet?.user?.username,
      email: req.wallet?.user?.email,
      fullName: req.wallet?.user?.profile?.fullName,
      avatar: req.wallet?.user?.profile?.avatar,
    };
  });

  return { requests, pagination: { page: Number(page), limit: Number(limit), total: count } };
};

const getAdminUserWalletsService = async (data) => {
  const { page = 1, limit = 15, search } = data;
  const offset = (page - 1) * limit;

  const userWhere = {};
  if (search) {
    userWhere[Op.or] = [
      { username: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
    ];
  }

  const { rows, count } = await Wallet.findAndCountAll({
    attributes: ["id", "userId", "balance", "status", "createdAt"],
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "username", "email"],
        where: userWhere,
        include: [{ model: Profile, as: "profile", attributes: ["fullName", "avatar"] }],
      },
    ],
    limit: Number(limit),
    offset: Number(offset),
    order: [["balance", "DESC"]],
    distinct: true,
  });

  const wallets = rows.map((w) => {
    const wallet = w.toJSON();
    return {
      id: wallet.id,
      balance: Number(wallet.balance),
      status: wallet.status,
      createdAt: wallet.createdAt,
      userId: wallet.userId,
      username: wallet.user?.username,
      email: wallet.user?.email,
      fullName: wallet.user?.profile?.fullName,
      avatar: wallet.user?.profile?.avatar,
    };
  });

  return { wallets, pagination: { page: Number(page), limit: Number(limit), total: count } };
};

// P0: Duyệt yêu cầu rút tiền — admin đã chuyển khoản thực tế, xác nhận để trừ balance
const approveWithdrawRequestService = async (withdrawRequestId) => {
  // Đọc trước (không lock) để lấy walletId và check status sớm
  const withdrawRaw = await WithdrawRequest.findByPk(withdrawRequestId);
  if (!withdrawRaw) throw new NotFoundError("Yêu cầu rút tiền không tồn tại");
  if (withdrawRaw.status !== WITHDRAW_REQUEST_STATUS.CONFIRMED) {
    throw new BadRequestError("Yêu cầu chưa được xác nhận OTP hoặc đã xử lý");
  }

  return sequelize.transaction(async (t) => {
    // Lock theo thứ tự: Wallet → WithdrawRequest → WalletTransaction
    const wallet = await Wallet.findOne({
      where: { id: withdrawRaw.walletId },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!wallet) throw new NotFoundError("Ví không tồn tại");

    const withdrawRequest = await WithdrawRequest.findOne({
      where: { id: withdrawRequestId, status: WITHDRAW_REQUEST_STATUS.CONFIRMED },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!withdrawRequest) throw new BadRequestError("Yêu cầu đã được xử lý hoặc không hợp lệ");

    if (Number(wallet.balance) < Number(withdrawRequest.amount)) {
      throw new BadRequestError("Số dư ví không đủ để thực hiện");
    }

    const tx = await WalletTransaction.findOne({
      where: {
        withdrawRequestId,
        type: WALLET_TRANSACTION_TYPE.WITHDRAW,
        status: WALLET_TRANSACTION_STATUS.PENDING,
      },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!tx) throw new BadRequestError("Giao dịch không tồn tại");

    await wallet.update(
      { balance: sequelize.literal(`balance - ${Number(withdrawRequest.amount)}`) },
      { transaction: t },
    );
    await withdrawRequest.update(
      { status: WITHDRAW_REQUEST_STATUS.SUCCESS, processedAt: new Date() },
      { transaction: t },
    );
    await tx.update({ status: WALLET_TRANSACTION_STATUS.SUCCESS }, { transaction: t });
  });
};

// P0: Từ chối yêu cầu rút tiền — hoàn lại trạng thái, không trừ balance
const rejectWithdrawRequestService = async (withdrawRequestId) => {
  const withdrawRaw = await WithdrawRequest.findByPk(withdrawRequestId);
  if (!withdrawRaw) throw new NotFoundError("Yêu cầu rút tiền không tồn tại");
  if (withdrawRaw.status !== WITHDRAW_REQUEST_STATUS.CONFIRMED) {
    throw new BadRequestError("Yêu cầu chưa được xác nhận OTP hoặc đã xử lý");
  }

  return sequelize.transaction(async (t) => {
    const withdrawRequest = await WithdrawRequest.findOne({
      where: { id: withdrawRequestId, status: WITHDRAW_REQUEST_STATUS.CONFIRMED },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!withdrawRequest) throw new BadRequestError("Yêu cầu đã được xử lý hoặc không hợp lệ");

    const tx = await WalletTransaction.findOne({
      where: {
        withdrawRequestId,
        type: WALLET_TRANSACTION_TYPE.WITHDRAW,
        status: WALLET_TRANSACTION_STATUS.PENDING,
      },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!tx) throw new BadRequestError("Giao dịch không tồn tại");

    await withdrawRequest.update(
      { status: WITHDRAW_REQUEST_STATUS.FAILED, processedAt: new Date() },
      { transaction: t },
    );
    await tx.update({ status: WALLET_TRANSACTION_STATUS.FAILED }, { transaction: t });
  });
};

// P1: Khóa/mở khóa ví người dùng
const toggleWalletStatusService = async (walletId, status) => {
  if (!Object.values(WALLET_STATUS).includes(status)) {
    throw new BadRequestError("Trạng thái ví không hợp lệ");
  }

  const wallet = await Wallet.findByPk(walletId);
  if (!wallet) throw new NotFoundError("Ví không tồn tại");

  await wallet.update({ status });
  return { id: wallet.id, status: wallet.status };
};

// P2: Thống kê tổng quan tài chính cho admin
const getAdminFinanceStatsService = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [pendingWithdrawCount, pendingWithdrawAmount, todayDeposit, totalSystemBalance] =
    await Promise.all([
      WithdrawRequest.count({ where: { status: WITHDRAW_REQUEST_STATUS.CONFIRMED } }),
      WithdrawRequest.sum("amount", { where: { status: WITHDRAW_REQUEST_STATUS.CONFIRMED } }),
      WalletTransaction.sum("amount", {
        where: {
          type: WALLET_TRANSACTION_TYPE.DEPOSIT,
          status: WALLET_TRANSACTION_STATUS.SUCCESS,
          createdAt: { [Op.gte]: today },
        },
      }),
      Wallet.sum("balance"),
    ]);

  return {
    pendingWithdrawCount: pendingWithdrawCount || 0,
    pendingWithdrawAmount: Number(pendingWithdrawAmount || 0),
    todayDeposit: Number(todayDeposit || 0),
    totalSystemBalance: Number(totalSystemBalance || 0),
  };
};

const adminFinanceService = {
  getAdminWalletTransactionsService,
  getAdminWithdrawRequestsService,
  getAdminUserWalletsService,
  approveWithdrawRequestService,
  rejectWithdrawRequestService,
  toggleWalletStatusService,
  getAdminFinanceStatsService,
};

export default adminFinanceService;
