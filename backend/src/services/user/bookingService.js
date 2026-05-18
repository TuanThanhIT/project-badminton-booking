import { v4 as uuidv4 } from "uuid";
import { dateFormat, VNPay, VnpLocale } from "vnpay";
import { Op } from "sequelize";
import sequelize from "../../config/db.js";
import {
  Booking,
  BookingDetail,
  Branch,
  Court,
  CourtPrice,
  Discount,
  Payment,
  Wallet,
  WalletTransaction,
} from "../../models/index.js";
import NotFoundError from "../../errors/NotFoundError.js";
import BadRequestError from "../../errors/BadRequestError.js";
import { BOOKING_STATUS } from "../../constants/bookingConstant.js";
import {
  PAYMENT_METHOD_STATUS,
  PAYMENT_STATUS,
  TARGET_PAYMENT_TYPE,
  WALLET_TRANSACTION_STATUS,
  WALLET_TRANSACTION_TYPE,
} from "../../constants/paymentConstant.js";
import { verifyVNPayURL } from "../../utils/handleVNPayURL.js";
import {
  DISCOUNT_APPLY_TYPE,
  DISCOUNT_TYPE,
} from "../../constants/discountConstant.js";
import { applyDiscountUsage } from "../shared/applyDiscountUsage.js";

const MIN_BOOKING_LEAD_MINUTES = 60;

const getTodayDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const dateTimeFromDateAndTime = (date, time) => {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute, 0, 0);
};

const normalizeDateInput = (value) => {
  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  return String(value).split("T")[0];
};

const assertBookableStartTime = ({ playDate, startTime }) => {
  const date = normalizeDateInput(playDate);
  const today = getTodayDate();

  if (date < today) {
    throw new BadRequestError("Khong the dat san cho ngay trong qua khu");
  }

  const now = new Date();
  const earliest = new Date(
    now.getTime() + MIN_BOOKING_LEAD_MINUTES * 60 * 1000,
  );

  if (date === today && dateTimeFromDateAndTime(date, startTime) < earliest) {
    throw new BadRequestError(
      "Gio bat dau phai sau thoi diem hien tai it nhat 1 tieng",
    );
  }
};

const timeToNumber = (time) => {
  const [hour, minute] = time.split(":").map(Number);
  return hour + minute / 60;
};

const getBookingPrice = async ({
  branchId,
  playDate,
  startTime,
  endTime,
  transaction,
}) => {
  const start = timeToNumber(startTime);
  const end = timeToNumber(endTime);

  if (end <= start) {
    throw new BadRequestError("Giờ kết thúc phải sau giờ bắt đầu");
  }

  const dayNames = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];
  const dayOfWeek = dayNames[new Date(playDate).getDay()];

  const configs = await CourtPrice.findAll({
    where: {
      branchId,
      dayOfWeek,
      [Op.and]: [
        { startTime: { [Op.lt]: endTime } },
        { endTime: { [Op.gt]: startTime } },
      ],
    },
    transaction,
  });

  let totalAmount = 0;
  let coveredDuration = 0;

  for (const config of configs) {
    const overlapStart = Math.max(start, timeToNumber(config.startTime));
    const overlapEnd = Math.min(end, timeToNumber(config.endTime));

    if (overlapEnd > overlapStart) {
      totalAmount += (overlapEnd - overlapStart) * Number(config.price);
      coveredDuration += overlapEnd - overlapStart;
    }
  }

  if (coveredDuration < end - start - 0.01) {
    throw new BadRequestError(
      "Sân không hoạt động hoặc chưa có giá trong khung giờ này",
    );
  }

  return Math.round(totalAmount);
};

const calculateBookingDiscount = async ({
  discountId,
  bookingAmount,
  transaction,
}) => {
  if (!discountId) {
    return {
      discount: null,
      discountAmount: 0,
      finalAmount: bookingAmount,
    };
  }

  const discount = await Discount.findByPk(discountId, {
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  if (!discount) {
    throw new NotFoundError("Mã giảm giá không tồn tại");
  }

  if (!discount.isActive) {
    throw new BadRequestError("Mã giảm giá đã bị vô hiệu hóa");
  }

  const today = new Date().toISOString().split("T")[0];

  if (discount.startDate > today) {
    throw new BadRequestError("Mã giảm giá chưa bắt đầu");
  }

  if (discount.endDate < today) {
    throw new BadRequestError("Mã giảm giá đã hết hạn");
  }

  if (
    discount.applyType !== DISCOUNT_APPLY_TYPE.BOOKING &&
    discount.applyType !== DISCOUNT_APPLY_TYPE.ALL
  ) {
    throw new BadRequestError("Mã không áp dụng cho đặt sân");
  }

  if (bookingAmount < Number(discount.minAmount || 0)) {
    throw new BadRequestError(
      `Đơn hàng tối thiểu ${Number(discount.minAmount).toLocaleString(
        "vi-VN",
      )}đ để áp dụng mã này`,
    );
  }

  if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
    throw new BadRequestError("Mã giảm giá đã hết lượt sử dụng");
  }

  let discountAmount =
    discount.type === DISCOUNT_TYPE.PERCENT
      ? (bookingAmount * Number(discount.value)) / 100
      : Number(discount.value);

  if (discount.type === DISCOUNT_TYPE.PERCENT && discount.maxDiscount) {
    discountAmount = Math.min(discountAmount, Number(discount.maxDiscount));
  }

  discountAmount = Math.min(Math.round(discountAmount), bookingAmount);

  return {
    discount,
    discountAmount,
    finalAmount: Math.max(0, bookingAmount - discountAmount),
  };
};

const assertBookingSlotAvailable = async ({
  courtId,
  playDate,
  startTime,
  endTime,
  transaction,
}) => {
  const overlap = await BookingDetail.findOne({
    where: {
      courtId,
      playDate,
      [Op.and]: [
        { startTime: { [Op.lt]: endTime } },
        { endTime: { [Op.gt]: startTime } },
      ],
    },
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  if (overlap) {
    throw new BadRequestError("Khung giờ này đã có người đặt");
  }
};

const createVNPayUrl = async ({ booking, amount, ip, transaction }) => {
  const txnRef = uuidv4();

  await Payment.create(
    {
      paymentAmount: amount,
      paymentMethod: PAYMENT_METHOD_STATUS.VNPAY,
      paymentStatus: PAYMENT_STATUS.PENDING,
      targetPaymentType: TARGET_PAYMENT_TYPE.BOOKING,
      targetPaymentId: booking.id,
      externalId: txnRef,
    },
    { transaction },
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

  return vnpay.buildPaymentUrl({
    vnp_Amount: amount,
    vnp_IpAddr: ip,
    vnp_TxnRef: txnRef,
    vnp_OrderInfo: `booking_${booking.id}`,
    vnp_OrderType: "booking",
    vnp_ReturnUrl: process.env.VNP_RETURN_URL,
    vnp_Locale: VnpLocale.VN,
    vnp_CreateDate: dateFormat(new Date()),
    vnp_ExpireDate: dateFormat(tomorrow),
  });
};

const createBookingService = async (bookingData) => {
  const {
    userId,
    branchId,
    courtId,
    playDate,
    startTime,
    endTime,
    paymentMethod,
    discountId,
    note,
    ip,
  } = bookingData;

  assertBookableStartTime({ playDate, startTime });

  return sequelize.transaction(async (transaction) => {
    const branch = await Branch.findByPk(branchId, { transaction });
    if (!branch) throw new NotFoundError("Chi nhánh không tồn tại");

    const court = await Court.findOne({
      where: { id: courtId, branchId },
      transaction,
    });
    if (!court) throw new NotFoundError("Sân không tồn tại");

    await assertBookingSlotAvailable({
      courtId,
      playDate,
      startTime,
      endTime,
      transaction,
    });

    const totalAmount = await getBookingPrice({
      branchId,
      playDate,
      startTime,
      endTime,
      transaction,
    });

    const { discountAmount, finalAmount } = await calculateBookingDiscount({
      discountId,
      bookingAmount: totalAmount,
      transaction,
    });

    const bookingStatus =
      paymentMethod === PAYMENT_METHOD_STATUS.COD
        ? BOOKING_STATUS.PENDING
        : BOOKING_STATUS.PENDING;

    const booking = await Booking.create(
      {
        userId,
        branchId,
        discountId: discountId || null,
        totalAmount: finalAmount,
        bookingStatus,
        note,
      },
      { transaction },
    );

    if (discountId) {
      await applyDiscountUsage(discountId, transaction);
    }

    await BookingDetail.create(
      {
        bookingId: booking.id,
        courtId,
        playDate,
        startTime,
        endTime,
        price: totalAmount,
      },
      { transaction },
    );

    if (paymentMethod === PAYMENT_METHOD_STATUS.COD) {
      await Payment.create(
        {
          targetPaymentType: TARGET_PAYMENT_TYPE.BOOKING,
          targetPaymentId: booking.id,
          paymentAmount: finalAmount,
          paymentMethod: PAYMENT_METHOD_STATUS.COD,
          paymentStatus: PAYMENT_STATUS.PENDING,
        },
        { transaction },
      );

      return {
        bookingId: booking.id,
        amount: finalAmount,
        discountAmount,
        paymentMethod,
        status: booking.bookingStatus,
      };
    }

    if (paymentMethod === PAYMENT_METHOD_STATUS.WALLET) {
      const wallet = await Wallet.findOne({
        where: { userId },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!wallet) throw new NotFoundError("Ví không tồn tại");

      if (Number(wallet.balance) < finalAmount) {
        throw new BadRequestError("Số dư ví không đủ");
      }

      const payment = await Payment.create(
        {
          targetPaymentType: TARGET_PAYMENT_TYPE.BOOKING,
          targetPaymentId: booking.id,
          paymentAmount: finalAmount,
          paymentMethod: PAYMENT_METHOD_STATUS.WALLET,
          paymentStatus: PAYMENT_STATUS.PAID,
          paidAt: new Date(),
        },
        { transaction },
      );

      await wallet.update(
        { balance: sequelize.literal(`balance - ${Number(finalAmount)}`) },
        { transaction },
      );

      await WalletTransaction.create(
        {
          walletId: wallet.id,
          paymentId: payment.id,
          amount: finalAmount,
          type: WALLET_TRANSACTION_TYPE.PAYMENT,
          status: WALLET_TRANSACTION_STATUS.SUCCESS,
          description: `Thanh toán đặt sân #${booking.id}`,
        },
        { transaction },
      );

      await booking.update(
        { bookingStatus: BOOKING_STATUS.PAID },
        { transaction },
      );

      return {
        bookingId: booking.id,
        amount: finalAmount,
        discountAmount,
        paymentMethod,
        status: BOOKING_STATUS.PAID,
      };
    }

    if (paymentMethod === PAYMENT_METHOD_STATUS.VNPAY) {
      const paymentUrl = await createVNPayUrl({
        booking,
        amount: finalAmount,
        ip,
        transaction,
      });

      return {
        bookingId: booking.id,
        amount: finalAmount,
        discountAmount,
        paymentMethod,
        paymentUrl,
        status: booking.bookingStatus,
      };
    }

    throw new BadRequestError("Phương thức thanh toán không hợp lệ");
  });
};

const bookingCallbackService = async (data) => {
  const isValid = verifyVNPayURL(data);
  if (!isValid) {
    throw new BadRequestError("Chữ ký không hợp lệ");
  }

  const { vnp_TxnRef, vnp_ResponseCode, vnp_TransactionNo, vnp_Amount } = data;
  if (vnp_ResponseCode !== "00") {
    throw new BadRequestError("Thanh toán thất bại");
  }

  const paymentRaw = await Payment.findOne({
    where: { externalId: vnp_TxnRef },
  });

  if (!paymentRaw) throw new NotFoundError("Thanh toán không tồn tại");
  if (paymentRaw.paymentStatus === PAYMENT_STATUS.PAID) return;

  const paidAmount = Math.round(Number(vnp_Amount) / 100);
  const expectedAmount = Math.round(Number(paymentRaw.paymentAmount));
  if (paidAmount !== expectedAmount) {
    throw new BadRequestError("Số tiền không hợp lệ");
  }

  return sequelize.transaction(async (transaction) => {
    const payment = await Payment.findByPk(paymentRaw.id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (payment.paymentStatus === PAYMENT_STATUS.PAID) return;
    if (payment.targetPaymentType !== TARGET_PAYMENT_TYPE.BOOKING) {
      throw new BadRequestError("Giao dịch không phải thanh toán đặt sân");
    }

    const booking = await Booking.findByPk(payment.targetPaymentId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!booking) throw new NotFoundError("Lịch đặt sân không tồn tại");

    await payment.update(
      {
        paymentStatus: PAYMENT_STATUS.PAID,
        transId: vnp_TransactionNo,
        paidAt: new Date(),
      },
      { transaction },
    );

    await booking.update(
      { bookingStatus: BOOKING_STATUS.PAID },
      { transaction },
    );
  });
};

const getMyBookingsService = async (data) => {
  const { userId, page = 1, limit = 10, status, date } = data;
  const offset = (page - 1) * limit;
  const where = { userId };
  if (status && status !== "ALL") where.bookingStatus = status;

  const detailWhere = {};
  if (date) detailWhere.playDate = date;

  const { rows, count } = await Booking.findAndCountAll({
    where,
    limit: Number(limit),
    offset: Number(offset),
    order: [["createdDate", "DESC"]],
    distinct: true,
    include: [
      {
        model: BookingDetail,
        as: "details",
        where: Object.keys(detailWhere).length ? detailWhere : undefined,
        include: [{ model: Court, as: "court", attributes: ["courtName"] }],
      },
      { model: Branch, as: "branch", attributes: ["branchName", "address"] },
    ],
  });

  const bookingIds = rows.map((booking) => booking.id);
  const payments = bookingIds.length
    ? await Payment.findAll({
        where: {
          targetPaymentType: TARGET_PAYMENT_TYPE.BOOKING,
          targetPaymentId: { [Op.in]: bookingIds },
        },
      })
    : [];
  const paymentMap = new Map(
    payments.map((payment) => [payment.targetPaymentId, payment]),
  );

  return {
    items: rows.map((booking) => {
      const payment = paymentMap.get(booking.id);

      return {
        bookingId: booking.id,
        bookingStatus: booking.bookingStatus,
        totalAmount: booking.totalAmount,
        note: booking.note,
        createdDate: booking.createdDate,
        branch: booking.branch,
        payment: payment
          ? {
              method: payment.paymentMethod,
              status: payment.paymentStatus,
            }
          : null,
        details: booking.details.map((detail) => ({
          courtId: detail.courtId,
          courtName: detail.court?.courtName,
          playDate: detail.playDate,
          startTime: detail.startTime,
          endTime: detail.endTime,
          price: detail.price,
        })),
      };
    }),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
};

export default {
  createBookingService,
  bookingCallbackService,
  getMyBookingsService,
};
