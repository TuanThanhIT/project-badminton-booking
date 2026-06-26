import sequelize from "../../config/db.js";
import { Op } from "sequelize";
import {
  Booking,
  BookingDetail,
  Branch,
  Court,
  Payment,
  Profile,
  User,
  Wallet,
  WalletTransaction,
} from "../../models/index.js";
import BadRequestError from "../../errors/BadRequestError.js";
import NotFoundError from "../../errors/NotFoundError.js";
import {
  BOOKING_STATUS,
  CANCELLED_BY,
} from "../../constants/bookingConstant.js";
import {
  PAYMENT_METHOD_STATUS,
  PAYMENT_OFFLINE_METHOD_STATUS,
  PAYMENT_STATUS,
  TARGET_PAYMENT_TYPE,
  WALLET_STATUS,
  WALLET_TRANSACTION_STATUS,
  WALLET_TRANSACTION_TYPE,
} from "../../constants/paymentConstant.js";
import {
  assertEmployeeActiveCashierForBranch,
  getActiveCashierBranchIds,
} from "./branchAccessService.js";
import { sendUserNotification } from "../../helpers/notification.js";
import { formatBookingCode } from "../../utils/displayCode.js";
import { handleSendBookingMail } from "../shared/sendBookingMail.js";
import { restoreDiscountUsage } from "../shared/applyDiscountUsage.js";

const bookingInclude = [
  {
    model: Branch,
    as: "branch",
    attributes: [
      "id",
      "branchName",
      "address",
      "wardName",
      "districtName",
      "provinceName",
      "phoneNumber",
    ],
  },
  {
    model: User,
    as: "user",
    attributes: ["id", "username", "email"],
    include: [
      {
        model: Profile,
        as: "profile",
        attributes: ["fullName", "phoneNumber"],
      },
    ],
  },
  {
    model: BookingDetail,
    as: "details",
    include: [{ model: Court, as: "court", attributes: ["id", "courtName"] }],
  },
];

const mapBooking = (booking, payment = null) => {
  const plain = booking.get ? booking.get({ plain: true }) : booking;

  return {
    id: plain.id,
    bookingStatus: plain.bookingStatus,
    previousBookingStatus: plain.previousBookingStatus,
    totalAmount: Number(plain.totalAmount || 0),
    note: plain.note,
    cancelledBy: plain.cancelledBy,
    cancelReason: plain.cancelReason,
    cancelRejectReason: plain.cancelRejectReason,
    cancelRequestedAt: plain.cancelRequestedAt,
    cancelHandledAt: plain.cancelHandledAt,
    cancelledAt: plain.cancelledAt,
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt,
    branch: plain.branch || null,
    user: plain.user || null,
    customer: plain.user
      ? {
          fullName:
            plain.user.profile?.fullName || plain.user.username || "Khùch",
          phoneNumber: plain.user.profile?.phoneNumber || "",
        }
      : null,
    payment: payment
      ? {
          id: payment.id,
          paymentMethod: payment.paymentMethod,
          paymentStatus: payment.paymentStatus,
          paymentAmount: Number(payment.paymentAmount || 0),
          paidAt: payment.paidAt,
          refundAmount: Number(payment.refundAmount || 0),
          refundAt: payment.refundAt,
        }
      : null,
    details:
      plain.details?.map((detail) => ({
        id: detail.id,
        courtId: detail.courtId,
        courtName: detail.court?.courtName || null,
        playDate: detail.playDate,
        startTime: detail.startTime,
        endTime: detail.endTime,
        price: Number(detail.price || 0),
      })) || [],
  };
};

const attachBookingPayments = async (bookings) => {
  const bookingIds = bookings.map((booking) => booking.id);
  const payments = bookingIds.length
    ? await Payment.findAll({
        where: {
          targetPaymentType: TARGET_PAYMENT_TYPE.BOOKING,
          targetPaymentId: bookingIds,
        },
      })
    : [];

  const paymentMap = new Map(
    payments.map((payment) => [payment.targetPaymentId, payment]),
  );

  return bookings.map((booking) =>
    mapBooking(booking, paymentMap.get(booking.id)),
  );
};

const getPrimaryDetail = (booking) => {
  const details = booking.details || [];
  return [...details].sort((a, b) =>
    `${a.playDate} ${a.startTime}`.localeCompare(`${b.playDate} ${b.startTime}`),
  )[0];
};

const getLastDetail = (booking) => {
  const details = booking.details || [];
  return [...details].sort((a, b) =>
    `${b.playDate} ${b.endTime}`.localeCompare(`${a.playDate} ${a.endTime}`),
  )[0];
};

const toLocalDateTime = (date, time) => {
  const [year, month, day] = String(date).split("-").map(Number);
  const [hour, minute] = String(time).split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute, 0, 0);
};

const assertNoShowWindowReached = (booking) => {
  const firstDetail = getPrimaryDetail(booking);
  if (!firstDetail) return;

  const noShowAt = new Date(
    toLocalDateTime(firstDetail.playDate, firstDetail.startTime).getTime() +
      30 * 60 * 1000,
  );

  if (Date.now() < noShowAt.getTime()) {
    throw new BadRequestError(
      "Ch? du?c h?y v?ng m?t sau khi khùch tr? nh?n sùn quù 30 phùt.",
    );
  }
};

const assertBookingPlayTimeEnded = (booking) => {
  const lastDetail = getLastDetail(booking);
  if (!lastDetail) return;

  const endAt = toLocalDateTime(lastDetail.playDate, lastDetail.endTime);
  if (Date.now() < endAt.getTime()) {
    throw new BadRequestError(
      "Ch? du?c hoùn thùnh sau khi khùch dù dùnh h?t th?i gian d?t sùn.",
    );
  }
};

const getBookingPayment = async ({ booking, transaction, lock = false }) =>
  Payment.findOne({
    where: {
      targetPaymentType: TARGET_PAYMENT_TYPE.BOOKING,
      targetPaymentId: booking.id,
    },
    transaction,
    lock: lock ? transaction?.LOCK?.UPDATE : undefined,
  });

const getDepositDescription = (booking) =>
  `C?c gi? sùn ${formatBookingCode(booking.id, booking.createdAt)}`;

const getBookingMailPayload = async ({ bookingId, transaction }) => {
  const booking = await Booking.findByPk(bookingId, {
    include: [
      { model: Branch, as: "branch" },
      {
        model: User,
        as: "user",
        attributes: ["id", "username", "email"],
        include: [
          {
            model: Profile,
            as: "profile",
            attributes: ["fullName", "phoneNumber"],
          },
        ],
      },
      {
        model: BookingDetail,
        as: "details",
        include: [{ model: Court, as: "court", attributes: ["id", "courtName"] }],
      },
    ],
    transaction,
  });

  if (!booking) return null;

  const payment = await getBookingPayment({ booking, transaction });
  const plain = booking.get({ plain: true });
  plain.payment = payment?.get ? payment.get({ plain: true }) : payment;
  plain.bookingCode = formatBookingCode(booking.id, booking.createdAt);
  plain.depositAmount =
    plain.payment?.paymentMethod === PAYMENT_METHOD_STATUS.COD
      ? Math.round(Number(booking.totalAmount || 0) * 0.5)
      : 0;

  return plain;
};

const sendBookingMailSafely = async ({ bookingId, type, penaltyAmount = 0 }) => {
  try {
    const booking = await getBookingMailPayload({ bookingId });
    if (!booking) return;

    booking.penaltyAmount = penaltyAmount;
    await handleSendBookingMail(booking, type);
  } catch (error) {
    console.error("Send booking email failed", error.message);
  }
};

const releaseBookingDeposit = async ({ booking, payment, transaction }) => {
  if (payment?.paymentMethod !== PAYMENT_METHOD_STATUS.COD) return;

  await WalletTransaction.update(
    { status: WALLET_TRANSACTION_STATUS.CANCELLED },
    {
      where: {
        paymentId: payment.id,
        status: WALLET_TRANSACTION_STATUS.PENDING,
        description: getDepositDescription(booking),
      },
      transaction,
    },
  );
};

const chargeNoShowDeposit = async ({ booking, payment, transaction }) => {
  if (payment?.paymentMethod !== PAYMENT_METHOD_STATUS.COD) {
    return { charged: false, amount: 0 };
  }

  const tx = await WalletTransaction.findOne({
    where: {
      paymentId: payment.id,
      status: WALLET_TRANSACTION_STATUS.PENDING,
      description: getDepositDescription(booking),
    },
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  if (!tx) return { charged: false, amount: 0 };

  const wallet = await Wallet.findByPk(tx.walletId, {
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  if (!wallet || Number(wallet.balance) < Number(tx.amount)) {
    throw new BadRequestError("Vù khùch khùng d? s? du d? tr? c?c gi? sùn.");
  }

  await wallet.update(
    { balance: sequelize.literal(`balance - ${Number(tx.amount)}`) },
    { transaction },
  );

  await tx.update({ status: WALLET_TRANSACTION_STATUS.SUCCESS }, { transaction });

  return { charged: true, amount: Number(tx.amount) };
};

const getBookingsService = async (data) => {
  const { employeeId, status, keyword, date, page = 1, limit = 12 } = data;

  const branchIds = await getActiveCashierBranchIds(employeeId);
  if (!branchIds.length) {
    return {
      items: [],
      summary: {},
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: 0,
        totalPages: 0,
      },
    };
  }

  const where = {
    branchId: branchIds,
  };

  if (status && status !== "ALL") where.bookingStatus = status;

  const detailWhere = {};
  if (date) detailWhere.playDate = date;

  if (keyword) {
    where[Op.or] = [
      { id: Number(keyword) || 0 },
      { "$user.username$": { [Op.like]: `%${keyword}%` } },
      { "$user.email$": { [Op.like]: `%${keyword}%` } },
    ];
  }

  const offset = (Number(page) - 1) * Number(limit);

  const { rows, count } = await Booking.findAndCountAll({
    where,
    include: bookingInclude.map((item) =>
      item.as === "details"
        ? {
            ...item,
            where: Object.keys(detailWhere).length ? detailWhere : undefined,
          }
        : item,
    ),
    distinct: true,
    subQuery: false,
    order: [["createdAt", "DESC"]],
    limit: Number(limit),
    offset,
  });

  const allInBranch = await Booking.findAll({
    where: { branchId: branchIds },
    attributes: ["bookingStatus"],
  });

  const summary = allInBranch.reduce((acc, booking) => {
    acc[booking.bookingStatus] = (acc[booking.bookingStatus] || 0) + 1;
    return acc;
  }, {});

  return {
    items: await attachBookingPayments(rows),
    summary,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: count,
      totalPages: Math.ceil(count / Number(limit)),
    },
  };
};

const getBookingDetailService = async (data) => {
  const { bookingId, employeeId } = data;
  const booking = await Booking.findByPk(bookingId, {
    include: bookingInclude,
  });

  if (!booking) throw new NotFoundError("L?ch d?t sùn khùng t?n t?i");

  await assertEmployeeActiveCashierForBranch({
    employeeId,
    branchId: booking.branchId,
  });

  const payment = await Payment.findOne({
    where: {
      targetPaymentType: TARGET_PAYMENT_TYPE.BOOKING,
      targetPaymentId: booking.id,
    },
  });

  return mapBooking(booking, payment);
};

const confirmBookingService = async (data) => {
  const { bookingId, employeeId } = data;
  const booking = await sequelize.transaction(async (transaction) => {
    const booking = await getEmployeeBookingForAction({
      bookingId,
      employeeId,
      transaction,
    });

    if (booking.bookingStatus !== BOOKING_STATUS.PENDING) {
      throw new BadRequestError(
        "Ch? cù th? xùc nh?n l?ch sùn dang ch? xùc nh?n",
      );
    }

    await booking.update(
      {
        bookingStatus: BOOKING_STATUS.CONFIRMED,
        previousBookingStatus: BOOKING_STATUS.PENDING,
      },
      { transaction },
    );

    return booking;
  });

  await sendUserNotification(
    booking.userId,
    "booking-confirmed",
    "L?ch sùn dù du?c xùc nh?n",
    `${booking.branch?.branchName || "Chi nhùnh"} dù xùc nh?n l?ch sùn ${formatBookingCode(booking.id, booking.createdAt)}. Vui lùng d?n dùng gi? vù xu?t trùnh email xùc nh?n d? nh?n sùn.`,
  );

  await sendBookingMailSafely({ bookingId: booking.id, type: "confirm" });
};

const completeBookingService = async (data) => {
  const { bookingId, employeeId, paymentMethod } = data;
  const booking = await sequelize.transaction(async (transaction) => {
    const booking = await getEmployeeBookingForAction({
      bookingId,
      employeeId,
      transaction,
    });

    if (booking.bookingStatus !== BOOKING_STATUS.CHECKED_IN) {
      throw new BadRequestError("Ch? cù th? hoùn thùnh l?ch sùn dù nh?n sùn");
    }

    assertBookingPlayTimeEnded(booking);

    let payment = await getBookingPayment({
      booking,
      transaction,
      lock: true,
    });

    if (!payment) {
      payment = await Payment.create(
        {
          targetPaymentType: TARGET_PAYMENT_TYPE.BOOKING,
          targetPaymentId: booking.id,
          paymentAmount: booking.totalAmount,
          paymentMethod: PAYMENT_METHOD_STATUS.COD,
          paymentStatus: PAYMENT_STATUS.UNPAID,
        },
        { transaction },
      );
    }

    await releaseBookingDeposit({ booking, payment, transaction });

    if (payment.paymentStatus !== PAYMENT_STATUS.PAID) {
      if (
        !paymentMethod ||
        !Object.values(PAYMENT_OFFLINE_METHOD_STATUS).includes(paymentMethod)
      ) {
        throw new BadRequestError(
          "Vui lùng ch?n phuong th?c thanh toùn t?i sùn",
        );
      }

      await payment.update(
        {
          paymentMethod,
          paymentStatus: PAYMENT_STATUS.PAID,
          paidAt: new Date(),
        },
        { transaction },
      );
    }

    await booking.update(
      { bookingStatus: BOOKING_STATUS.COMPLETED },
      { transaction },
    );

    return booking;
  });

  await sendUserNotification(
    booking.userId,
    "booking-completed",
    "L?ch sùn dù hoùn t?t",
    `L?ch sùn ${formatBookingCode(booking.id, booking.createdAt)} t?i ${booking.branch?.branchName || "chi nhùnh"} dù du?c hoùn t?t. C?m on b?n dù s? d?ng d?ch v? B-Hub.`,
  );

  await sendBookingMailSafely({ bookingId: booking.id, type: "complete" });
};

const receiveBookingService = async (data) => {
  const { bookingId, employeeId } = data;
  const booking = await sequelize.transaction(async (transaction) => {
    const booking = await getEmployeeBookingForAction({
      bookingId,
      employeeId,
      transaction,
    });

    if (booking.bookingStatus !== BOOKING_STATUS.CONFIRMED) {
      throw new BadRequestError("Ch? cù th? nh?n sùn cho l?ch dù xùc nh?n");
    }

    await booking.update(
      {
        bookingStatus: BOOKING_STATUS.CHECKED_IN,
        previousBookingStatus: BOOKING_STATUS.CONFIRMED,
      },
      { transaction },
    );

    return booking;
  });

  await sendUserNotification(
    booking.userId,
    "booking-checked-in",
    "B?n dù nh?n sùn",
    `L?ch sùn ${formatBookingCode(booking.id, booking.createdAt)} t?i ${booking.branch?.branchName || "chi nhùnh"} dù du?c xùc nh?n nh?n sùn. Chùc b?n cù bu?i choi vui v?.`,
  );

  await sendBookingMailSafely({ bookingId: booking.id, type: "checkedIn" });
};

const getEmployeeBookingForAction = async ({
  bookingId,
  employeeId,
  transaction,
}) => {
  const booking = await Booking.findByPk(bookingId, {
    include: [
      { model: Branch, as: "branch" },
      {
        model: User,
        as: "user",
        attributes: ["id", "username", "email"],
        include: [
          {
            model: Profile,
            as: "profile",
            attributes: ["fullName", "phoneNumber"],
          },
        ],
      },
      {
        model: BookingDetail,
        as: "details",
        include: [{ model: Court, as: "court", attributes: ["id", "courtName"] }],
      },
    ],
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  if (!booking) throw new NotFoundError("L?ch d?t sùn khùng t?n t?i");

  await assertEmployeeActiveCashierForBranch({
    employeeId,
    branchId: booking.branchId,
    transaction,
  });

  return booking;
};

const refundBookingToWallet = async ({ booking, transaction }) => {
  const payment = await Payment.findOne({
    where: {
      targetPaymentType: TARGET_PAYMENT_TYPE.BOOKING,
      targetPaymentId: booking.id,
      paymentStatus: PAYMENT_STATUS.PAID,
    },
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  if (!payment) {
    return {
      refunded: false,
      refundAmount: 0,
    };
  }

  const refundDescription = `Hoùn ti?n l?ch sùn ${formatBookingCode(booking.id, booking.createdAt)}`;

  let wallet = await Wallet.findOne({
    where: { userId: booking.userId },
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  if (!wallet) {
    wallet = await Wallet.create(
      {
        userId: booking.userId,
        balance: 0,
        status: WALLET_STATUS.ACTIVE,
      },
      { transaction },
    );
  }

  const existedRefund = await WalletTransaction.findOne({
    where: {
      walletId: wallet.id,
      paymentId: payment.id,
      type: WALLET_TRANSACTION_TYPE.REFUND,
      description: refundDescription,
    },
    transaction,
  });

  if (existedRefund) {
    return {
      refunded: false,
      refundAmount: 0,
    };
  }

  const refundAmount = Number(
    payment.paymentAmount || booking.totalAmount || 0,
  );

  await wallet.update(
    {
      balance: sequelize.literal(`balance + ${refundAmount}`),
    },
    { transaction },
  );

  await payment.update(
    {
      paymentStatus: PAYMENT_STATUS.REFUNDED,
      refundAmount,
      refundAt: new Date(),
    },
    { transaction },
  );

  await WalletTransaction.create(
    {
      walletId: wallet.id,
      paymentId: payment.id,
      amount: refundAmount,
      type: WALLET_TRANSACTION_TYPE.REFUND,
      status: WALLET_TRANSACTION_STATUS.SUCCESS,
      description: refundDescription,
    },
    { transaction },
  );

  return {
    refunded: true,
    refundAmount,
  };
};

const approveCancelBookingService = async (data) => {
  const { bookingId, employeeId } = data;
  let refundResult;
  let handledBooking;

  await sequelize.transaction(async (transaction) => {
    const booking = await getEmployeeBookingForAction({
      bookingId,
      employeeId,
      transaction,
    });

    if (booking.bookingStatus !== BOOKING_STATUS.CANCEL_REQUESTED) {
      throw new BadRequestError("L?ch sùn chua cù yùu c?u h?y");
    }

    const payment = await getBookingPayment({
      booking,
      transaction,
      lock: true,
    });
    await releaseBookingDeposit({ booking, payment, transaction });

    refundResult = await refundBookingToWallet({ booking, transaction });

    if (booking.discountId) {
      await restoreDiscountUsage(
        booking.discountId,
        transaction,
        booking.userId,
      );
    }

    await booking.update(
      {
        bookingStatus: BOOKING_STATUS.CANCELLED,
        cancelHandledAt: new Date(),
        cancelledAt: new Date(),
      },
      { transaction },
    );

    handledBooking = booking;
  });

  await sendUserNotification(
    handledBooking.userId,
    "booking-cancel-approved",
    "Yùu c?u h?y l?ch sùn dù du?c duy?t",
    refundResult?.refunded
      ? `L?ch sùn ${formatBookingCode(handledBooking.id, handledBooking.createdAt)} dù du?c h?y vù hoùn ${Number(
          refundResult.refundAmount,
        ).toLocaleString("vi-VN")}d vùo vù.`
      : `L?ch sùn ${formatBookingCode(handledBooking.id, handledBooking.createdAt)} dù du?c h?y thùnh cùng.`,
  );

  return {
    refund: refundResult,
  };
};

const rejectCancelBookingService = async (data) => {
  const { bookingId, employeeId, reason } = data;
  const booking = await sequelize.transaction(async (transaction) => {
    const booking = await getEmployeeBookingForAction({
      bookingId,
      employeeId,
      transaction,
    });

    if (booking.bookingStatus !== BOOKING_STATUS.CANCEL_REQUESTED) {
      throw new BadRequestError("L?ch sùn chua cù yùu c?u h?y");
    }

    await booking.update(
      {
        bookingStatus:
          booking.previousBookingStatus || BOOKING_STATUS.CONFIRMED,
        previousBookingStatus: null,
        cancelRejectReason: reason || null,
        cancelHandledAt: new Date(),
      },
      { transaction },
    );

    return booking;
  });

  await sendUserNotification(
    booking.userId,
    "booking-cancel-rejected",
    "Yùu c?u h?y l?ch sùn b? t? ch?i",
    reason
      ? `Yùu c?u h?y l?ch sùn ${formatBookingCode(booking.id, booking.createdAt)} b? t? ch?i. Lù do: ${reason}`
      : `Yùu c?u h?y l?ch sùn ${formatBookingCode(booking.id, booking.createdAt)} b? t? ch?i.`,
  );
};

const cancelNoShowBookingService = async (data) => {
  const { bookingId, employeeId, reason } = data;
  let refundResult;
  let handledBooking;

  await sequelize.transaction(async (transaction) => {
    const booking = await getEmployeeBookingForAction({
      bookingId,
      employeeId,
      transaction,
    });

    if (booking.bookingStatus !== BOOKING_STATUS.CONFIRMED) {
      throw new BadRequestError(
        "Ch? cù th? h?y v?ng m?t l?ch sùn dù xùc nh?n",
      );
    }

    assertNoShowWindowReached(booking);

    if (
      [
        BOOKING_STATUS.CANCELLED,
        BOOKING_STATUS.COMPLETED,
        BOOKING_STATUS.FAILED,
      ].includes(booking.bookingStatus)
    ) {
      throw new BadRequestError("Tr?ng thùi l?ch sùn hi?n t?i khùng th? h?y");
    }

    const payment = await getBookingPayment({
      booking,
      transaction,
      lock: true,
    });
    const penalty = await chargeNoShowDeposit({
      booking,
      payment,
      transaction,
    });

    refundResult = penalty.charged
      ? { refunded: false, refundAmount: 0, penaltyAmount: penalty.amount }
      : await refundBookingToWallet({ booking, transaction });

    if (booking.discountId) {
      await restoreDiscountUsage(
        booking.discountId,
        transaction,
        booking.userId,
      );
    }

    await booking.update(
      {
        previousBookingStatus: booking.bookingStatus,
        bookingStatus: BOOKING_STATUS.CANCELLED,
        cancelledBy: CANCELLED_BY.EMPLOYEE,
        cancelReason: reason || "Khùch khùng d?n nh?n sùn",
        cancelHandledAt: new Date(),
        cancelledAt: new Date(),
      },
      { transaction },
    );

    handledBooking = booking;
  });

  await sendUserNotification(
    handledBooking.userId,
    "booking-cancelled-by-employee",
    "L?ch sùn dù b? h?y",
    refundResult?.refunded
      ? `L?ch sùn ${formatBookingCode(handledBooking.id, handledBooking.createdAt)} dù b? h?y vù hoùn ${Number(
          refundResult.refundAmount,
        ).toLocaleString("vi-VN")}d vùo vù.`
      : `L?ch sùn ${formatBookingCode(handledBooking.id, handledBooking.createdAt)} dù b? h?y. Lù do: ${reason || "Khùch khùng d?n nh?n sùn"}`,
  );

  await sendBookingMailSafely({
    bookingId: handledBooking.id,
    type: "cancel",
    penaltyAmount: refundResult?.penaltyAmount || 0,
  });

  return {
    refund: refundResult,
  };
};

const employeeBookingService = {
  getBookingsService,
  getBookingDetailService,
  confirmBookingService,
  receiveBookingService,
  completeBookingService,
  approveCancelBookingService,
  rejectCancelBookingService,
  cancelNoShowBookingService,
};

export default employeeBookingService;
