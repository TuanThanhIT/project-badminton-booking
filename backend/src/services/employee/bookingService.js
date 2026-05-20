import sequelize from "../../config/db.js";
import { Op } from "sequelize";
import {
  Booking,
  BookingDetail,
  Branch,
  Court,
  Payment,
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
  assertEmployeeCanAccessBranch,
  getEmployeeBranchIds,
} from "./branchAccessService.js";

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
    createdDate: plain.createdDate,
    updatedDate: plain.updatedDate,
    branch: plain.branch || null,
    user: plain.user || null,
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

const getBookingsService = async ({
  employeeId,
  status,
  keyword,
  date,
  page = 1,
  limit = 12,
}) => {
  const branchIds = await getEmployeeBranchIds(employeeId);
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
    order: [["createdDate", "DESC"]],
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

const getBookingDetailService = async ({ bookingId, employeeId }) => {
  const booking = await Booking.findByPk(bookingId, {
    include: bookingInclude,
  });

  if (!booking) throw new NotFoundError("Lịch đặt sân không tồn tại");

  await assertEmployeeCanAccessBranch({
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

const confirmBookingService = async ({ bookingId, employeeId }) => {
  await sequelize.transaction(async (transaction) => {
    const booking = await getEmployeeBookingForAction({
      bookingId,
      employeeId,
      transaction,
    });

    if (booking.bookingStatus !== BOOKING_STATUS.PENDING) {
      throw new BadRequestError(
        "Chỉ có thể xác nhận lịch sân đang chờ xác nhận",
      );
    }

    await booking.update(
      {
        bookingStatus: BOOKING_STATUS.CONFIRMED,
        previousBookingStatus: BOOKING_STATUS.PENDING,
      },
      { transaction },
    );
  });
};

const completeBookingService = async ({
  bookingId,
  employeeId,
  paymentMethod,
}) => {
  await sequelize.transaction(async (transaction) => {
    const booking = await getEmployeeBookingForAction({
      bookingId,
      employeeId,
      transaction,
    });

    if (booking.bookingStatus !== BOOKING_STATUS.CONFIRMED) {
      throw new BadRequestError("Chỉ có thể hoàn thành lịch sân đã xác nhận");
    }

    let payment = await Payment.findOne({
      where: {
        targetPaymentType: TARGET_PAYMENT_TYPE.BOOKING,
        targetPaymentId: booking.id,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
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

    if (payment.paymentStatus !== PAYMENT_STATUS.PAID) {
      if (
        !paymentMethod ||
        !Object.values(PAYMENT_OFFLINE_METHOD_STATUS).includes(paymentMethod)
      ) {
        throw new BadRequestError(
          "Vui lòng chọn phương thức thanh toán tại sân",
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
  });
};

const getEmployeeBookingForAction = async ({
  bookingId,
  employeeId,
  transaction,
}) => {
  const booking = await Booking.findByPk(bookingId, {
    include: [
      { model: Branch, as: "branch" },
      { model: BookingDetail, as: "details" },
    ],
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  if (!booking) throw new NotFoundError("Lịch đặt sân không tồn tại");

  await assertEmployeeCanAccessBranch({
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

  const refundDescription = `Hoàn tiền lịch sân #${booking.id}`;

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

const approveCancelBookingService = async ({ bookingId, employeeId }) => {
  let refundResult;

  await sequelize.transaction(async (transaction) => {
    const booking = await getEmployeeBookingForAction({
      bookingId,
      employeeId,
      transaction,
    });

    if (booking.bookingStatus !== BOOKING_STATUS.CANCEL_REQUESTED) {
      throw new BadRequestError("Lịch sân chưa có yêu cầu hủy");
    }

    refundResult = await refundBookingToWallet({ booking, transaction });

    await booking.update(
      {
        bookingStatus: BOOKING_STATUS.CANCELLED,
        cancelHandledAt: new Date(),
        cancelledAt: new Date(),
      },
      { transaction },
    );
  });

  return {
    refund: refundResult,
  };
};

const rejectCancelBookingService = async ({
  bookingId,
  employeeId,
  reason,
}) => {
  await sequelize.transaction(async (transaction) => {
    const booking = await getEmployeeBookingForAction({
      bookingId,
      employeeId,
      transaction,
    });

    if (booking.bookingStatus !== BOOKING_STATUS.CANCEL_REQUESTED) {
      throw new BadRequestError("Lịch sân chưa có yêu cầu hủy");
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
  });
};

const cancelNoShowBookingService = async ({
  bookingId,
  employeeId,
  reason,
}) => {
  let refundResult;

  await sequelize.transaction(async (transaction) => {
    const booking = await getEmployeeBookingForAction({
      bookingId,
      employeeId,
      transaction,
    });

    if (booking.bookingStatus !== BOOKING_STATUS.PENDING) {
      throw new BadRequestError(
        "Chi co the huy truc tiep lich san dang cho xac nhan",
      );
    }

    if (
      [
        BOOKING_STATUS.CANCELLED,
        BOOKING_STATUS.COMPLETED,
        BOOKING_STATUS.FAILED,
      ].includes(booking.bookingStatus)
    ) {
      throw new BadRequestError("Trạng thái lịch sân hiện tại không thể hủy");
    }

    refundResult = await refundBookingToWallet({ booking, transaction });

    await booking.update(
      {
        previousBookingStatus: booking.bookingStatus,
        bookingStatus: BOOKING_STATUS.CANCELLED,
        cancelledBy: CANCELLED_BY.EMPLOYEE,
        cancelReason: reason || "Khách không đến nhận sân",
        cancelHandledAt: new Date(),
        cancelledAt: new Date(),
      },
      { transaction },
    );
  });

  return {
    refund: refundResult,
  };
};

const employeeBookingService = {
  getBookingsService,
  getBookingDetailService,
  confirmBookingService,
  completeBookingService,
  approveCancelBookingService,
  rejectCancelBookingService,
  cancelNoShowBookingService,
};

export default employeeBookingService;
