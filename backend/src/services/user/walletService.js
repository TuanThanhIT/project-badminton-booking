import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import crypto from "crypto";
import sequelize from "../../config/db.js";
import Payment from "../../models/payment.js";
import {
  PAYMENT_METHOD_STATUS,
  PAYMENT_STATUS,
  TARGET_PAYMENT_TYPE,
  WALLET_TRANSACTION_TYPE,
  WITHDRAW_REQUEST_STATUS,
} from "../../constants/paymentConstant.js";
import Wallet from "../../models/wallet.js";
import NotFoundError from "../../errors/NotFoundError.js";
import BadRequestError from "../../errors/BadRequestError.js";
import WalletTransaction from "../../models/walletTransaction.js";
import { VnpLocale, dateFormat, VNPay } from "vnpay";
import { verifyVNPayURL } from "../../utils/handleVNPayURL.js";
import WithdrawRequest from "../../models/withDrawRequest.js";
import mailer from "../../helpers/mailer.js";
import User from "../../models/user.js";

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

    await Payment.create(
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
      vnp_OrderInfo: `Nap tien vao vi thanh toan`,
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
  return sequelize.transaction(async (t) => {
    // 1. verify chữ ký
    const isValid = verifyVNPayURL(data);
    if (!isValid) {
      throw new BadRequestError("Chữ ký không hợp lệ");
    }

    const { vnp_TxnRef, vnp_ResponseCode, vnp_TransactionNo, vnp_Amount } =
      data;

    if (vnp_ResponseCode !== "00") {
      throw new BadRequestError("Thanh toán thất bại");
    }

    // 2. tìm payment
    const payment = await Payment.findOne({
      where: { externalId: vnp_TxnRef },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!payment) {
      throw new NotFoundError("Thanh toán không tồn tại");
    }

    // chống xử lý lại
    if (payment.paymentStatus === PAYMENT_STATUS.SUCCESS) {
      return; // idempotent
    }

    // check số tiền
    if (Number(payment.paymentAmount) !== Number(vnp_Amount) / 100) {
      throw new BadRequestError("Số tiền không hợp lệ");
    }

    // 3. update payment
    payment.paymentStatus = PAYMENT_STATUS.SUCCESS;
    payment.transId = vnp_TransactionNo;
    payment.paidAt = new Date();
    await payment.save({ transaction: t });

    // 4. lấy wallet (dùng walletId)
    const wallet = await Wallet.findOne({
      where: { id: payment.targetPaymentId },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!wallet) {
      throw new NotFoundError("Ví không tồn tại");
    }

    // 5. cộng tiền
    const newBalance =
      parseFloat(wallet.balance) + parseFloat(payment.paymentAmount);

    wallet.balance = newBalance;
    await wallet.save({ transaction: t });

    // 6. log transaction
    await WalletTransaction.create(
      {
        walletId: wallet.id,
        paymentId: payment.id,
        amount: payment.paymentAmount,
        type: WALLET_TRANSACTION_TYPE.DEPOSIT,
        balanceAfter: newBalance,
        description: "Nạp tiền VNPay",
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

    if (!wallet) {
      throw new NotFoundError("Ví thanh toán không tồn tại");
    }

    const currentBalance = parseFloat(wallet.balance);

    if (currentBalance < amount) {
      throw new BadRequestError("Số dư không đủ");
    }

    wallet.balanceLocked += amount;
    await wallet.save({ transaction: t });

    const otpCode = crypto.randomInt(100000, 999999).toString();
    const otpHash = crypto.createHash("sha256").update(otpCode).digest("hex");
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    const withdrawRequest = await WithdrawRequest.create(
      {
        walletId: wallet.id,
        amount,
        bankName,
        bankAccount,
        accountHolder,
        status: WITHDRAW_REQUEST_STATUS.PENDING,
        otpCode: otpHash,
        otpExpiry,
      },
      { transaction: t },
    );

    await WalletTransaction.create(
      {
        walletId: wallet.id,
        withdrawRequestId: withdrawRequest.id,
        amount,
        type: WALLET_TRANSACTION_TYPE.WITHDRAW,
        balanceAfter: currentBalance,
        description: `Yêu cầu rút ${amount} VND về ${bankName} - ${bankAccount}`,
      },
      { transaction: t },
    );

    t.afterCommit(() =>
      mailer
        .sendOtpMail(user.email, otpCode, "Mã OTP xác thực rút tiền")
        .catch((err) => console.error("Send OTP email failed", err)),
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
  const { withdrawRequestId, otpCode } = data;

  return sequelize.transaction(async (t) => {
    const withdrawRequest = await WithdrawRequest.findByPk(withdrawRequestId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!withdrawRequest) {
      throw new NotFoundError("Yêu cầu rút tiền không tồn tại");
    }

    if (withdrawRequest.status !== WITHDRAW_REQUEST_STATUS.PENDING) {
      throw new BadRequestError("Yêu cầu không hợp lệ hoặc đã xử lý");
    }

    // attempts check
    if (withdrawRequest.attempts >= 5) {
      await withdrawRequest.update(
        {
          status: WITHDRAW_REQUEST_STATUS.FAILED,
          otpCode: null,
          otpExpiry: null,
        },
        { transaction: t },
      );

      throw new BadRequestError("OTP đã bị khóa");
    }

    const otpCodeHash = crypto
      .createHash("sha256")
      .update(otpCode)
      .digest("hex");

    if (new Date(withdrawRequest.otpExpiry) <= new Date()) {
      throw new BadRequestError("Mã OTP đã hết hạn");
    }

    if (withdrawRequest.otpCode !== otpCodeHash) {
      await withdrawRequest.update(
        { attempts: withdrawRequest.attempts + 1 },
        { transaction: t },
      );

      throw new BadRequestError("Mã OTP không chính xác");
    }

    // đúng OTP
    await withdrawRequest.update(
      {
        status: WITHDRAW_REQUEST_STATUS.CONFIRMED,
        otpCode: null,
        otpExpiry: null,
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
