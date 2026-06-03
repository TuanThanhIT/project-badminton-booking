import { Op } from "sequelize";
import {
  Booking,
  BookingDetail,
  Branch,
  BranchManager,
  Court,
  Payment,
  Profile,
  User,
} from "../../models/index.js";
import NotFoundError from "../../errors/NotFoundError.js";
import { TARGET_PAYMENT_TYPE } from "../../constants/paymentConstant.js";

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

const getManagerBranchId = async (managerId) => {
  const branchManager = await BranchManager.findOne({
    attributes: ["branchId"],
    where: { managerId, isActive: true },
    raw: true,
  });

  if (!branchManager) {
    throw new NotFoundError("Manager has no active branch");
  }

  return branchManager.branchId;
};

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
            plain.user.profile?.fullName || plain.user.username || "Khách",
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
    payments.map((payment) => [Number(payment.targetPaymentId), payment]),
  );

  return bookings.map((booking) =>
    mapBooking(booking, paymentMap.get(Number(booking.id)) || null),
  );
};

const getBookingsService = async (managerId, query = {}) => {
  const {
    status,
    keyword,
    date,
    page = 1,
    limit = 10,
  } = query;
  const branchId = await getManagerBranchId(managerId);
  const where = { branchId };

  if (status && status !== "ALL") where.bookingStatus = status;

  const detailWhere = {};
  if (date) detailWhere.playDate = date;

  if (keyword) {
    where[Op.or] = [
      { id: Number(keyword) || 0 },
      { "$user.username$": { [Op.like]: `%${keyword}%` } },
      { "$user.email$": { [Op.like]: `%${keyword}%` } },
      { "$user.profile.fullName$": { [Op.like]: `%${keyword}%` } },
      { "$user.profile.phoneNumber$": { [Op.like]: `%${keyword}%` } },
    ];
  }

  const numericPage = Number(page);
  const numericLimit = Number(limit);
  const offset = (numericPage - 1) * numericLimit;

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
    limit: numericLimit,
    offset,
  });

  const allInBranch = await Booking.findAll({
    where: { branchId },
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
      page: numericPage,
      limit: numericLimit,
      total: count,
      totalPages: Math.ceil(count / numericLimit),
    },
  };
};

const getBookingDetailService = async (managerId, bookingId) => {
  const branchId = await getManagerBranchId(managerId);
  const booking = await Booking.findOne({
    where: { id: bookingId, branchId },
    include: bookingInclude,
  });

  if (!booking) throw new NotFoundError("Lịch đặt sân không tồn tại");

  const payment = await Payment.findOne({
    where: {
      targetPaymentType: TARGET_PAYMENT_TYPE.BOOKING,
      targetPaymentId: booking.id,
    },
  });

  return mapBooking(booking, payment);
};

export default {
  getBookingsService,
  getBookingDetailService,
};
