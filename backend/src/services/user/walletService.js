import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import crypto from "crypto";
import sequelize from "../../config/db.js";
import {
  Payment,
  Wallet,
  WalletTransaction,
  WithdrawRequest,
  User,
  UserOtp,
} from "../../models/index.js";
import {
  PAYMENT_METHOD_STATUS,
  PAYMENT_STATUS,
  TARGET_PAYMENT_TYPE,
  WALLET_TRANSACTION_STATUS,
  WALLET_TRANSACTION_TYPE,
  WITHDRAW_REQUEST_STATUS,
} from "../../constants/paymentConstant.js";
import NotFoundError from "../../errors/NotFoundError.js";
import BadRequestError from "../../errors/BadRequestError.js";
import { VnpLocale, dateFormat, VNPay } from "vnpay";
import { verifyVNPayURL } from "../../utils/handleVNPayURL.js";
import mailer from "../../helpers/mailer.js";
import { OTP_TYPE } from "../../constants/userConstant.js";
import ForbiddenError from "../../errors/ForbiddenError.js";

dotenv.config();

const walletDepositService = async (data) => {
  const { amount, userId, ip } = data;
  return sequelize.transaction(async (t) => {
    const txnRef = uuidv4();

    const wallet = await Wallet.findOne({
      where: { userId },
      transaction: t,
      lock: true,
    });

    if (!wallet) {
      throw new NotFoundError("Ví thanh toán không tồn tại");
    }

    const payment = await Payment.create(
      {
        paymentAmount: amount,
        paymentMethod: PAYMENT_METHOD_STATUS.VNPAY,
        paymentStatus: PAYMENT_STATUS.PENDING,
        targetPaymentType: TARGET_PAYMENT_TYPE.WALLET_TOPUP,
        targetPaymentId: wallet.id,
        externalId: txnRef,
      },
      { transaction: t },
    );

    await WalletTransaction.create(
      {
        walletId: wallet.id,
        paymentId: payment.id,
        amount,
        type: WALLET_TRANSACTION_TYPE.DEPOSIT,
        expiredAt: new Date(Date.now() + 10 * 60 * 1000),
        status: WALLET_TRANSACTION_STATUS.PENDING,
        description: "Nạp tiền VNPay",
      },
      { transaction: t },
    );

    const vnpay = new VNPay({
      tmnCode: process.env.VNP_TMN_CODE,
      secureSecret: process.env.VNP_HASH_SECRET,
      vnpayHost: process.env.VNP_URL,
      testMode: true,
      hashAlgorithm: "SHA512",
    });

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const paymentUrl = await vnpay.buildPaymentUrl({
      vnp_Amount: amount,
      vnp_IpAddr: ip,
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: `wallet_topup`,
      vnp_OrderType: "topup",
      vnp_ReturnUrl: process.env.VNP_RETURN_URL,
      vnp_Locale: VnpLocale.VN,
      vnp_CreateDate: dateFormat(new Date()),
      vnp_ExpireDate: dateFormat(tomorrow),
    });

    return paymentUrl;
  });
};

const walletCallbackService = async (data) => {
  // 1. verify chữ ký (ngoài transaction để giảm thời gian lock)
  const isValid = verifyVNPayURL(data);
  if (!isValid) {
    throw new BadRequestError("Chữ ký không hợp lệ");
  }

  const { vnp_TxnRef, vnp_ResponseCode, vnp_TransactionNo, vnp_Amount } = data;

  // 2. lấy payment trước (KHÔNG lock)
  const paymentRaw = await Payment.findOne({
    where: { externalId: vnp_TxnRef },
  });

  if (!paymentRaw) {
    throw new NotFoundError("Thanh toán không tồn tại");
  }

  // idempotent sớm (giảm load DB + tránh lock)
  if (paymentRaw.paymentStatus === PAYMENT_STATUS.PAID) {
    return;
  }

  // check số tiền sớm
  if (Number(paymentRaw.paymentAmount) !== Number(vnp_Amount) / 100) {
    throw new BadRequestError("Số tiền không hợp lệ");
  }

  // 3. vào transaction
  return sequelize.transaction(async (t) => {
    // lock theo thứ tự CHUẨN: Wallet → Payment → Transaction

    // 1. lock wallet trước
    const wallet = await Wallet.findOne({
      where: { id: paymentRaw.targetPaymentId },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!wallet) {
      throw new NotFoundError("Ví không tồn tại");
    }

    // 2. lock lại payment
    const payment = await Payment.findOne({
      where: { id: paymentRaw.id },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    // idempotent lần 2 (rất quan trọng khi concurrent)
    if (payment.paymentStatus === PAYMENT_STATUS.PAID) {
      return;
    }

    // 3. lock transaction
    const tx = await WalletTransaction.findOne({
      where: {
        paymentId: payment.id,
        status: WALLET_TRANSACTION_STATUS.PENDING,
      },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!tx) {
      throw new BadRequestError("Giao dịch không tồn tại");
    }

    // check hết hạn
    if (tx.expiredAt && tx.expiredAt < new Date()) {
      await tx.update(
        { status: WALLET_TRANSACTION_STATUS.FAILED },
        { transaction: t },
      );
      throw new BadRequestError("Phiên thanh toán đã hết hạn");
    }

    // VNPay fail
    if (vnp_ResponseCode !== "00") {
      await tx.update(
        { status: WALLET_TRANSACTION_STATUS.FAILED },
        { transaction: t },
      );
      throw new BadRequestError("Thanh toán thất bại");
    }

    // 4. update payment
    await payment.update(
      {
        paymentStatus: PAYMENT_STATUS.PAID,
        transId: vnp_TransactionNo,
        paidAt: new Date(),
      },
      { transaction: t },
    );

    // 5. cộng tiền (atomic hơn)
    await wallet.update(
      {
        balance: sequelize.literal(
          `balance + ${Number(payment.paymentAmount)}`,
        ),
      },
      { transaction: t },
    );

    // 6. update transaction
    await tx.update(
      {
        status: WALLET_TRANSACTION_STATUS.SUCCESS,
      },
      { transaction: t },
    );
  });
};

const walletWithdrawRequestService = async (data) => {
  const { amount, bankName, bankAccount, accountHolder, userId } = data;

  return sequelize.transaction(async (t) => {
    const user = await User.findByPk(userId, { transaction: t });
    if (!user) {
      throw new NotFoundError("Người dùng không tồn tại");
    }

    const wallet = await Wallet.findOne({
      where: { userId },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!wallet) throw new NotFoundError("Ví không tồn tại");

    // tính available
    const pendingAmount = await WalletTransaction.sum("amount", {
      where: {
        walletId: wallet.id,
        status: "PENDING",
      },
      transaction: t,
    });

    const available = Number(wallet.balance) - Number(pendingAmount || 0);

    if (available < amount) {
      throw new BadRequestError("Số dư không đủ");
    }

    const withdrawRequest = await WithdrawRequest.create(
      {
        walletId: wallet.id,
        amount,
        bankName,
        bankAccount,
        accountHolder,
        status: WITHDRAW_REQUEST_STATUS.PENDING,
      },
      { transaction: t },
    );

    await WalletTransaction.create(
      {
        walletId: wallet.id,
        withdrawRequestId: withdrawRequest.id,
        amount,
        type: WALLET_TRANSACTION_TYPE.WITHDRAW,
        status: WALLET_TRANSACTION_STATUS.PENDING,
        expiredAt: new Date(Date.now() + 10 * 60 * 1000),
        description: `Yêu cầu rút ${amount} VND về ${bankName} - ${bankAccount}`,
      },
      { transaction: t },
    );

    const withdrawRequestReturn = {
      id: withdrawRequest.id,
      amount: withdrawRequest.amount,
      bankName: withdrawRequest.bankName,
      bankAccount: withdrawRequest.bankAccount,
      accountHolder: withdrawRequest.accountHolder,
      status: withdrawRequest.status,
      createdDate: withdrawRequest.createdDate,
    };

    return withdrawRequestReturn;
  });
};

const walletWithdrawConfirmService = async (data) => {
  const { withdrawRequestId, otpCode, userId } = data;

  const user = await User.findByPk(userId);
  if (!user) throw new NotFoundError("Người dùng không tồn tại");

  const otpCodeHash = crypto.createHash("sha256").update(otpCode).digest("hex");

  // 1. lấy OTP ngoài transaction (giảm lock time)
  const userOtp = await UserOtp.findOne({
    where: {
      userId: user.id,
      type: OTP_TYPE.WITHDRAW_REQUEST,
      isUsed: false,
    },
    order: [["createdDate", "DESC"]],
  });

  if (!userOtp) {
    throw new BadRequestError("OTP không tồn tại hoặc không hợp lệ");
  }

  if (userOtp.otpExpiry < new Date()) {
    throw new BadRequestError("OTP hết hạn");
  }

  // sai OTP
  if (userOtp.otpCode !== otpCodeHash) {
    await UserOtp.update(
      {
        attempts: sequelize.literal("attempts + 1"),
        isUsed: sequelize.literal(
          "CASE WHEN attempts + 1 >= 5 THEN true ELSE isUsed END",
        ),
      },
      { where: { id: userOtp.id } },
    );

    throw new BadRequestError("OTP không đúng");
  }

  // 2. transaction
  return sequelize.transaction(async (t) => {
    // 1. lock wallet trước
    const wallet = await Wallet.findOne({
      where: { userId },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!wallet) throw new NotFoundError("Ví không tồn tại");

    // 2. lock withdrawRequest
    const withdrawRequest = await WithdrawRequest.findOne({
      where: {
        id: withdrawRequestId,
        status: WITHDRAW_REQUEST_STATUS.PENDING,
      },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!withdrawRequest) {
      throw new NotFoundError("Yêu cầu rút tiền không tồn tại");
    }

    if (withdrawRequest.walletId !== wallet.id) {
      throw new ForbiddenError("Không có quyền");
    }

    // idempotent check
    if (withdrawRequest.status !== WITHDRAW_REQUEST_STATUS.PENDING) {
      throw new BadRequestError("Yêu cầu đã được xử lý");
    }

    // 3. lock transaction
    const tx = await WalletTransaction.findOne({
      where: {
        withdrawRequestId,
        status: WALLET_TRANSACTION_STATUS.PENDING,
      },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!tx) throw new BadRequestError("Transaction không tồn tại");

    // check expire
    if (tx.expiredAt && tx.expiredAt < new Date()) {
      await tx.update(
        { status: WALLET_TRANSACTION_STATUS.FAILED },
        { transaction: t },
      );

      await withdrawRequest.update(
        { status: WITHDRAW_REQUEST_STATUS.FAILED },
        { transaction: t },
      );

      throw new BadRequestError("Phiên rút tiền đã hết hạn");
    }

    // check balance
    if (Number(wallet.balance) < Number(tx.amount)) {
      throw new BadRequestError("Số dư không đủ");
    }

    // 4. lock OTP (CUỐI CÙNG)
    const otp = await UserOtp.findOne({
      where: {
        id: userOtp.id,
        isUsed: false,
      },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!otp) {
      throw new BadRequestError("OTP đã được sử dụng");
    }

    // 3. update trạng thái
    await withdrawRequest.update(
      {
        status: WITHDRAW_REQUEST_STATUS.CONFIRMED,
      },
      { transaction: t },
    );

    // lock tiền (atomic)
    await wallet.update(
      {
        balanceLocked: sequelize.literal(
          `balanceLocked + ${Number(tx.amount)}`,
        ),
      },
      { transaction: t },
    );

    // mark OTP used
    await otp.update(
      {
        isUsed: true,
        isVerified: true,
      },
      { transaction: t },
    );

    return withdrawRequest;
  });
};

const walletService = {
  walletDepositService,
  walletCallbackService,
  walletWithdrawRequestService,
  walletWithdrawConfirmService,
};

export default walletService;
