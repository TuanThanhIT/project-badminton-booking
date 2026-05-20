import { Op } from "sequelize";
import { StatusCodes } from "http-status-codes";
import sequelize from "../../config/db.js";
import ApiError from "../../errors/ApiError.js";
import {
  Beverage,
  Booking,
  BookingDetail,
  Branch,
  CashRegister,
  Court,
  CourtPrice,
  DraftBeverageItem,
  DraftBooking,
  DraftBookingItem,
  DraftProductItem,
  MonthlyBooking,
  OfflineBooking,
  Payment,
  Profile,
  Product,
  ProductVariant,
  User,
  VariantStock,
  WorkShift,
  WorkShiftEmployee,
} from "../../models/index.js";
import { BOOKING_STATUS } from "../../constants/bookingConstant.js";
import { DRAFT_BOOKING_STATUS } from "../../constants/draftBookingConstant.js";
import {
  PAYMENT_OFFLINE_METHOD_STATUS,
  PAYMENT_STATUS,
  TARGET_PAYMENT_TYPE,
} from "../../constants/paymentConstant.js";
import { ROLE_IN_SHIFT } from "../../constants/workShiftConstant.js";
import { assertEmployeeCanAccessBranch } from "./branchAccessService.js";

const dayNames = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

const normalizeTime = (time) => {
  if (!time || !/^\d{1,2}:\d{2}(:\d{2})?$/.test(time)) return null;
  const [hour, minute, second = "00"] = time.split(":");
  return `${hour.padStart(2, "0")}:${minute}:${second}`;
};

const timeToNumber = (time) => {
  const normalized = normalizeTime(time);
  const [hour, minute] = normalized.split(":").map(Number);
  return hour + minute / 60;
};

const toMoney = (value) => Math.round(Number(value || 0));

const BOARD_START_HOUR = 6;
const BOARD_END_HOUR = 23;
const BOARD_STEP_MINUTES = 30;

const numberToTime = (value) => {
  const hour = Math.floor(value);
  const minute = Math.round((value - hour) * 60);
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
};

const buildHalfHourBoardSlots = () => {
  const result = [];
  for (
    let value = BOARD_START_HOUR;
    value < BOARD_END_HOUR;
    value += BOARD_STEP_MINUTES / 60
  ) {
    result.push({
      startTime: numberToTime(value),
      endTime: numberToTime(value + BOARD_STEP_MINUTES / 60),
      price: 0,
    });
  }
  return result;
};

const getVietnamDate = () =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .formatToParts(new Date())
    .reduce((acc, part) => ({ ...acc, [part.type]: part.value }), {});

const getVietnamDateString = () => {
  const parts = getVietnamDate();
  return `${parts.year}-${parts.month}-${parts.day}`;
};

const getVietnamTimeNumber = () => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const hour = Number(parts.find((part) => part.type === "hour")?.value || 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value || 0);
  return hour + minute / 60;
};

const overlaps = (aStart, aEnd, bStart, bEnd) =>
  normalizeTime(aStart) < normalizeTime(bEnd) &&
  normalizeTime(aEnd) > normalizeTime(bStart);

const ACTIVE_BOOKING_BOARD_STATUSES = [
  BOOKING_STATUS.PENDING,
  BOOKING_STATUS.CONFIRMED,
  BOOKING_STATUS.CANCEL_REQUESTED,
  BOOKING_STATUS.COMPLETED,
];

const ACTIVE_MONTHLY_BOARD_STATUSES = ["PENDING", "PAID"];

const getCustomerInfo = (user) => {
  const fullName = user?.profile?.fullName || user?.username || "Khách";
  const phoneNumber = user?.profile?.phoneNumber || "";

  return {
    customerName: fullName,
    customerPhone: phoneNumber,
    customerDisplay: phoneNumber ? `${fullName} - ${phoneNumber}` : fullName,
  };
};

const assertEndAfterStart = (startTime, endTime) => {
  if (!normalizeTime(startTime) || !normalizeTime(endTime)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Khung giờ không hợp lệ.");
  }

  if (timeToNumber(endTime) <= timeToNumber(startTime)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Giờ kết thúc phải lớn hơn giờ bắt đầu.",
    );
  }
};

const getActiveSession = async (employeeId, transaction) => {
  const assignment = await WorkShiftEmployee.findOne({
    where: {
      employeeId,
      checkIn: { [Op.ne]: null },
      checkOut: null,
    },
    include: [
      {
        model: WorkShift,
        as: "workShift",
        include: [
          {
            model: Branch,
            as: "branch",
            attributes: ["id", "branchName", "address"],
          },
        ],
      },
      {
        model: CashRegister,
        as: "cashRegister",
      },
    ],
    transaction,
    lock: transaction?.LOCK?.UPDATE,
    order: [["checkIn", "DESC"]],
  });

  if (!assignment) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Nhân viên cần check-in và đăng ký tiền mặt đầu ca trước khi vào màn hình chính.",
    );
  }

  if (!assignment.cashRegister) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Ca làm chưa có phiên tiền mặt tại quầy.",
    );
  }

  await assertEmployeeCanAccessBranch({
    employeeId,
    branchId: assignment.workShift.branchId,
    transaction,
  });

  return assignment;
};

const assertCashier = (session) => {
  if (session.roleInShift !== ROLE_IN_SHIFT.CASHIER) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Chỉ nhân viên đứng quầy mới được thao tác đơn trực tiếp.",
    );
  }
};

const mapSession = (session) => ({
  assignmentId: session.id,
  workShiftId: session.workShiftId,
  employeeId: session.employeeId,
  roleInShift: session.roleInShift,
  checkIn: session.checkIn,
  checkOut: session.checkOut,
  canOperateCounter: session.roleInShift === ROLE_IN_SHIFT.CASHIER,
  cashRegister: session.cashRegister,
  branch: session.workShift.branch,
  workShift: {
    id: session.workShift.id,
    shiftName: session.workShift.shiftName,
    workDate: session.workShift.workDate,
    startTime: session.workShift.startTime,
    endTime: session.workShift.endTime,
    shiftStatus: session.workShift.shiftStatus,
  },
});

const getSessionService = async (employeeId) => {
  try {
    const session = await getActiveSession(employeeId);
    return mapSession(session);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};

const getProductsService = async (employeeId, keyword = "") => {
  try {
    const session = await getActiveSession(employeeId);
    const productWhere = {};

    if (keyword) {
      productWhere.productName = { [Op.like]: `%${keyword}%` };
    }

    const stocks = await VariantStock.findAll({
      where: { branchId: session.workShift.branchId },
      include: [
        {
          model: ProductVariant,
          as: "variant",
          attributes: ["id", "sku", "price", "discount", "size", "color", "material"],
          include: [
            {
              model: Product,
              as: "product",
              where: productWhere,
              attributes: ["id", "productName", "thumbnailUrl", "brand"],
            },
          ],
        },
      ],
      order: [[{ model: ProductVariant, as: "variant" }, "id", "ASC"]],
    });

    return stocks.map((stock) => ({
      id: stock.variant.id,
      variantId: stock.variant.id,
      productId: stock.variant.product.id,
      productName: stock.variant.product.productName,
      brand: stock.variant.product.brand,
      thumbnailUrl: stock.variant.product.thumbnailUrl,
      sku: stock.variant.sku,
      price: Number(stock.variant.price || 0),
      discount: Number(stock.variant.discount || 0),
      size: stock.variant.size,
      color: stock.variant.color,
      material: stock.variant.material,
      stock: Number(stock.stock || 0),
    }));
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};

const getBeveragesService = async (employeeId, keyword = "") => {
  try {
    await getActiveSession(employeeId);

    const where = {};
    if (keyword) {
      where.beverageName = { [Op.like]: `%${keyword}%` };
    }

    const beverages = await Beverage.findAll({
      where,
      attributes: ["id", "beverageName", "thumbnailUrl", "price", "stock"],
      order: [["beverageName", "ASC"]],
    });

    return beverages.map((beverage) => ({
      id: beverage.id,
      beverageName: beverage.beverageName,
      thumbnailUrl: beverage.thumbnailUrl,
      price: Number(beverage.price || 0),
      stock: Number(beverage.stock || 0),
    }));
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};

const getCourtPrice = async ({
  branchId,
  playDate,
  startTime,
  endTime,
  transaction,
}) => {
  assertEndAfterStart(startTime, endTime);

  const configs = await CourtPrice.findAll({
    where: {
      branchId,
      dayOfWeek: dayNames[new Date(`${playDate}T00:00:00`).getDay()],
      startTime: { [Op.lt]: normalizeTime(endTime) },
      endTime: { [Op.gt]: normalizeTime(startTime) },
    },
    transaction,
  });

  const start = timeToNumber(startTime);
  const end = timeToNumber(endTime);
  let total = 0;
  let coveredDuration = 0;

  for (const config of configs) {
    const overlapStart = Math.max(start, timeToNumber(config.startTime));
    const overlapEnd = Math.min(end, timeToNumber(config.endTime));

    if (overlapEnd > overlapStart) {
      total += (overlapEnd - overlapStart) * Number(config.price);
      coveredDuration += overlapEnd - overlapStart;
    }
  }

  if (coveredDuration < end - start - 0.01) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Chi nhánh chưa cấu hình giá cho khung giờ này.",
    );
  }

  return toMoney(total);
};

const calculateSlotPriceFromConfigs = (configs, startTime, endTime) => {
  const start = timeToNumber(startTime);
  const end = timeToNumber(endTime);
  let total = 0;
  let coveredDuration = 0;

  for (const config of configs) {
    const overlapStart = Math.max(start, timeToNumber(config.startTime));
    const overlapEnd = Math.min(end, timeToNumber(config.endTime));

    if (overlapEnd > overlapStart) {
      total += (overlapEnd - overlapStart) * Number(config.price);
      coveredDuration += overlapEnd - overlapStart;
    }
  }

  if (coveredDuration < end - start - 0.01) return null;
  return toMoney(total);
};

const getBlockedSlots = async ({ branchId, playDate, transaction }) => {
  const bookingDetails = await BookingDetail.findAll({
    where: { playDate },
    include: [
      {
        model: Booking,
        as: "booking",
        required: false,
        include: [
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
        ],
      },
      {
        model: MonthlyBooking,
        as: "monthlyBooking",
        required: false,
        include: [
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
        ],
      },
    ],
    transaction,
  });

  const bookingIds = bookingDetails
    .map((detail) => detail.booking?.id)
    .filter(Boolean);
  const payments = bookingIds.length
    ? await Payment.findAll({
        where: {
          targetPaymentType: TARGET_PAYMENT_TYPE.BOOKING,
          targetPaymentId: { [Op.in]: bookingIds },
        },
        transaction,
      })
    : [];
  const paymentMap = new Map(
    payments.map((payment) => [payment.targetPaymentId, payment]),
  );

  const bookingSlots = bookingDetails
    .filter((detail) => {
      const booking = detail.booking;
      const monthlyBooking = detail.monthlyBooking;
      const inBranch =
        Number(booking?.branchId) === Number(branchId) ||
        Number(monthlyBooking?.branchId) === Number(branchId);
      const activeBooking =
        booking &&
        ACTIVE_BOOKING_BOARD_STATUSES.includes(booking.bookingStatus);
      const activeMonthly =
        monthlyBooking &&
        ACTIVE_MONTHLY_BOARD_STATUSES.includes(monthlyBooking.status);

      return inBranch && (activeBooking || activeMonthly);
    })
    .map((detail) => {
      const customer = getCustomerInfo(
        detail.booking?.user || detail.monthlyBooking?.user,
      );
      const payment = detail.booking
        ? paymentMap.get(detail.booking.id)
        : null;

      return {
        source: detail.booking ? "BOOKING" : "MONTHLY",
        courtId: detail.courtId,
        playDate: detail.playDate,
        startTime: detail.startTime,
        endTime: detail.endTime,
        status: detail.booking?.bookingStatus || detail.monthlyBooking?.status,
        paymentStatus:
          payment?.paymentStatus === PAYMENT_STATUS.PAID ||
          detail.monthlyBooking?.status === "PAID"
            ? PAYMENT_STATUS.PAID
            : payment?.paymentStatus || PAYMENT_STATUS.UNPAID,
        customerName: customer.customerName,
        customerPhone: customer.customerPhone,
        customerDisplay: customer.customerDisplay,
        totalAmount: Number(
          detail.booking?.totalAmount || detail.monthlyBooking?.totalAmount || 0,
        ),
        referenceId: detail.booking?.id || detail.monthlyBooking?.id,
      };
    });

  const draftItems = await DraftBookingItem.findAll({
    where: { playDate },
    include: [
      {
        model: DraftBooking,
        as: "draft",
        where: {
          branchId,
          draftBookingStatus: {
            [Op.in]: [DRAFT_BOOKING_STATUS.DRAFT, DRAFT_BOOKING_STATUS.COMPLETED],
          },
        },
        required: true,
        include: [
          {
            model: OfflineBooking,
            as: "offlineBooking",
            required: false,
          },
        ],
      },
    ],
    transaction,
  });

  const draftSlots = draftItems.map((item) => ({
    source: "DRAFT",
    courtId: item.courtId,
    playDate: item.playDate,
    startTime: item.startTime,
    endTime: item.endTime,
    status: item.draft.draftBookingStatus,
    paymentStatus: item.draft.offlineBooking?.paymentStatus || PAYMENT_STATUS.PENDING,
    customerName: item.draft.nameCustomer,
    customerPhone: item.draft.phoneNumber || "",
    customerDisplay: item.draft.phoneNumber
      ? `${item.draft.nameCustomer} - ${item.draft.phoneNumber}`
      : item.draft.nameCustomer,
    totalAmount: Number(item.draft.totalAmount || 0),
    referenceId: item.draft.id,
  }));

  return [...bookingSlots, ...draftSlots];
};

const getCourtBoardService = async (employeeId, date) => {
  try {
    const session = await getActiveSession(employeeId);
    const branchId = session.workShift.branchId;

    const fixedTimeSlots = buildHalfHourBoardSlots();

    const [courts, priceConfigs, blockedSlots] = await Promise.all([
      Court.findAll({
        where: { branchId, courtStatus: "ACTIVE" },
        attributes: ["id", "courtName", "location", "thumbnailUrl"],
        order: [["id", "ASC"]],
      }),
      CourtPrice.findAll({
        where: {
          branchId,
          dayOfWeek: dayNames[new Date(`${date}T00:00:00`).getDay()],
        },
        order: [["startTime", "ASC"]],
      }),
      getBlockedSlots({ branchId, playDate: date }),
    ]);

    const slots = [];
    const today = getVietnamDateString();
    const nowNumber = getVietnamTimeNumber();

    for (const court of courts) {
      for (const timeSlot of fixedTimeSlots) {
        const blocked = blockedSlots.find(
          (item) =>
            item.courtId === court.id &&
            overlaps(
              timeSlot.startTime,
              timeSlot.endTime,
              item.startTime,
              item.endTime,
            ),
        );
        const price = calculateSlotPriceFromConfigs(
          priceConfigs,
          timeSlot.startTime,
          timeSlot.endTime,
        );
        const isPast =
          date < today ||
          (date === today && timeToNumber(timeSlot.endTime) <= nowNumber);
        const hasNoPrice = price === null;

        slots.push({
          key: `${court.id}-${timeSlot.startTime}-${timeSlot.endTime}`,
          courtId: court.id,
          courtName: court.courtName,
          location: court.location,
          playDate: date,
          startTime: timeSlot.startTime,
          endTime: timeSlot.endTime,
          price: price || 0,
          status: blocked || isPast || hasNoPrice ? "LOCKED" : "AVAILABLE",
          lockReason: blocked ? "BOOKED" : isPast ? "PAST" : hasNoPrice ? "NO_PRICE" : null,
          booking: blocked || null,
        });
      }
    }

    return {
      branch: session.workShift.branch,
      courts: courts.map((court) => ({
        id: court.id,
        courtName: court.courtName,
        location: court.location,
        thumbnailUrl: court.thumbnailUrl,
      })),
      timeSlots: fixedTimeSlots.map((slot) => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
        price: 0,
      })),
      slots,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};

const mapDraft = (draft) => ({
  id: draft.id,
  employeeId: draft.employeeId,
  branchId: draft.branchId,
  nameCustomer: draft.nameCustomer,
  phoneNumber: draft.phoneNumber || "",
  note: draft.note || "",
  draftBookingStatus: draft.draftBookingStatus,
  totalAmount: Number(draft.totalAmount || 0),
  createdDate: draft.createdDate,
  updatedDate: draft.updatedDate,
  courtItems:
    draft.courtItems?.map((item) => ({
      id: item.id,
      courtId: item.courtId,
      courtName: item.court?.courtName || "",
      playDate: item.playDate,
      startTime: item.startTime,
      endTime: item.endTime,
      price: Number(item.price || 0),
    })) || [],
  productItems:
    draft.productItems?.map((item) => ({
      id: item.id,
      productVariantId: item.productVariantId,
      productName: item.variant?.product?.productName || "",
      thumbnailUrl: item.variant?.product?.thumbnailUrl || "",
      size: item.variant?.size,
      color: item.variant?.color,
      price: Number(item.variant?.price || 0),
      quantity: Number(item.quantity || 0),
      subTotal: Number(item.subTotal || 0),
    })) || [],
  beverageItems:
    draft.beverageItems?.map((item) => ({
      id: item.id,
      beverageId: item.beverageId,
      beverageName: item.beverage?.beverageName || "",
      thumbnailUrl: item.beverage?.thumbnailUrl || "",
      price: Number(item.beverage?.price || 0),
      quantity: Number(item.quantity || 0),
      subTotal: Number(item.subTotal || 0),
    })) || [],
  offlineBooking: draft.offlineBooking
    ? {
        id: draft.offlineBooking.id,
        paymentMethod: draft.offlineBooking.paymentMethod,
        paymentStatus: draft.offlineBooking.paymentStatus,
        totalAmount: Number(draft.offlineBooking.totalAmount || 0),
        paidAt: draft.offlineBooking.paidAt,
      }
    : null,
});

const draftInclude = [
  {
    model: DraftBookingItem,
    as: "courtItems",
    include: [{ model: Court, as: "court", attributes: ["id", "courtName"] }],
  },
  {
    model: DraftProductItem,
    as: "productItems",
    include: [
      {
        model: ProductVariant,
        as: "variant",
        include: [
          {
            model: Product,
            as: "product",
            attributes: ["id", "productName", "thumbnailUrl"],
          },
        ],
      },
    ],
  },
  {
    model: DraftBeverageItem,
    as: "beverageItems",
    include: [{ model: Beverage, as: "beverage" }],
  },
  {
    model: OfflineBooking,
    as: "offlineBooking",
    required: false,
  },
];

const findDraftForEmployee = async ({ draftId, session, transaction }) => {
  const draft = await DraftBooking.findOne({
    where: {
      id: draftId,
      branchId: session.workShift.branchId,
    },
    include: draftInclude,
    transaction,
    lock: transaction?.LOCK?.UPDATE,
  });

  if (!draft) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Đơn tạm không tồn tại.");
  }

  return draft;
};

const getDraftsService = async (employeeId) => {
  try {
    const session = await getActiveSession(employeeId);
    const drafts = await DraftBooking.findAll({
      where: {
        branchId: session.workShift.branchId,
        draftBookingStatus: DRAFT_BOOKING_STATUS.DRAFT,
      },
      include: draftInclude,
      order: [["updatedDate", "DESC"]],
    });

    return drafts.map(mapDraft);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};

const createDraftService = async (employeeId, nameCustomer, phoneNumber) => {
  const t = await sequelize.transaction();

  try {
    const session = await getActiveSession(employeeId, t);
    assertCashier(session);

    const existed = await DraftBooking.findOne({
      where: {
        branchId: session.workShift.branchId,
        nameCustomer,
        phoneNumber,
        draftBookingStatus: DRAFT_BOOKING_STATUS.DRAFT,
      },
      transaction: t,
    });

    if (existed) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Khách hàng đang có đơn tạm tại chi nhánh này.",
      );
    }

    const draft = await DraftBooking.create(
      {
        employeeId,
        branchId: session.workShift.branchId,
        nameCustomer,
        phoneNumber,
      },
      { transaction: t },
    );

    await t.commit();

    return mapDraft(
      await DraftBooking.findByPk(draft.id, {
        include: draftInclude,
      }),
    );
  } catch (error) {
    await t.rollback();
    if (error instanceof ApiError) throw error;
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};

const assertCourtItemsAvailable = async ({
  branchId,
  draftId,
  courtItems,
  transaction,
}) => {
  const normalizedItems = [];
  const uniqueKeys = new Set();

  for (const item of courtItems) {
    assertEndAfterStart(item.startTime, item.endTime);

    const court = await Court.findOne({
      where: { id: item.courtId, branchId, courtStatus: "ACTIVE" },
      transaction,
    });

    if (!court) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Sân không thuộc chi nhánh hiện tại hoặc đã ngừng hoạt động.",
      );
    }

    const key = `${item.courtId}-${item.playDate}-${normalizeTime(item.startTime)}-${normalizeTime(item.endTime)}`;
    if (uniqueKeys.has(key)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Danh sách sân có khung giờ bị trùng.");
    }
    uniqueKeys.add(key);

    const lockedBookings = await BookingDetail.findAll({
      where: {
        courtId: item.courtId,
        playDate: item.playDate,
        startTime: { [Op.lt]: normalizeTime(item.endTime) },
        endTime: { [Op.gt]: normalizeTime(item.startTime) },
      },
      include: [
        {
          model: Booking,
          as: "booking",
          required: false,
        },
        {
          model: MonthlyBooking,
          as: "monthlyBooking",
          required: false,
        },
      ],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    const hasBookingOverlap = lockedBookings.some((detail) => {
      const booking = detail.booking;
      const monthlyBooking = detail.monthlyBooking;
      return (
        (booking?.branchId === branchId &&
          ACTIVE_BOOKING_BOARD_STATUSES.includes(booking.bookingStatus)) ||
        (monthlyBooking?.branchId === branchId &&
          ACTIVE_MONTHLY_BOARD_STATUSES.includes(monthlyBooking.status))
      );
    });

    if (hasBookingOverlap) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Khung giờ sân đã có khách đặt.");
    }

    const draftOverlap = await DraftBookingItem.findOne({
      where: {
        courtId: item.courtId,
        playDate: item.playDate,
        draftId: { [Op.ne]: draftId },
        startTime: { [Op.lt]: normalizeTime(item.endTime) },
        endTime: { [Op.gt]: normalizeTime(item.startTime) },
      },
      include: [
        {
          model: DraftBooking,
          as: "draft",
          where: {
            branchId,
            draftBookingStatus: {
              [Op.in]: [DRAFT_BOOKING_STATUS.DRAFT, DRAFT_BOOKING_STATUS.COMPLETED],
            },
          },
          required: true,
        },
      ],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (draftOverlap) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Khung giờ sân đang nằm trong đơn tạm khác.");
    }

    const price = await getCourtPrice({
      branchId,
      playDate: item.playDate,
      startTime: item.startTime,
      endTime: item.endTime,
      transaction,
    });

    normalizedItems.push({
      draftId,
      courtId: item.courtId,
      playDate: item.playDate,
      startTime: normalizeTime(item.startTime),
      endTime: normalizeTime(item.endTime),
      price,
    });
  }

  return normalizedItems;
};

const buildProductItems = async ({
  branchId,
  draftId,
  productItems,
  transaction,
}) => {
  const result = [];

  for (const item of productItems) {
    const stock = await VariantStock.findOne({
      where: { branchId, variantId: item.productVariantId },
      include: [{ model: ProductVariant, as: "variant" }],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!stock) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Sản phẩm không có tại chi nhánh này.");
    }

    if (Number(stock.stock) < Number(item.quantity)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Số lượng sản phẩm vượt quá tồn kho.");
    }

    result.push({
      draftId,
      productVariantId: item.productVariantId,
      quantity: Number(item.quantity),
      subTotal: toMoney(Number(stock.variant.price) * Number(item.quantity)),
    });
  }

  return result;
};

const buildBeverageItems = async ({ draftId, beverageItems, transaction }) => {
  const result = [];

  for (const item of beverageItems) {
    const beverage = await Beverage.findByPk(item.beverageId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!beverage) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Đồ uống không tồn tại.");
    }

    if (Number(beverage.stock) < Number(item.quantity)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Số lượng đồ uống vượt quá tồn kho.");
    }

    result.push({
      draftId,
      beverageId: item.beverageId,
      quantity: Number(item.quantity),
      subTotal: toMoney(Number(beverage.price) * Number(item.quantity)),
    });
  }

  return result;
};

const updateDraftService = async ({
  employeeId,
  draftId,
  nameCustomer,
  phoneNumber,
  note,
  courtItems = [],
  productItems = [],
  beverageItems = [],
}) => {
  const t = await sequelize.transaction();

  try {
    const session = await getActiveSession(employeeId, t);
    assertCashier(session);
    const draft = await findDraftForEmployee({ draftId, session, transaction: t });

    if (draft.draftBookingStatus !== DRAFT_BOOKING_STATUS.DRAFT) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Chỉ được cập nhật đơn tạm đang mở.");
    }

    const branchId = session.workShift.branchId;
    const courts = await assertCourtItemsAvailable({
      branchId,
      draftId: draft.id,
      courtItems,
      transaction: t,
    });
    const products = await buildProductItems({
      branchId,
      draftId: draft.id,
      productItems,
      transaction: t,
    });
    const beverages = await buildBeverageItems({
      draftId: draft.id,
      beverageItems,
      transaction: t,
    });

    const totalAmount =
      courts.reduce((sum, item) => sum + item.price, 0) +
      products.reduce((sum, item) => sum + item.subTotal, 0) +
      beverages.reduce((sum, item) => sum + item.subTotal, 0);

    await Promise.all([
      DraftBookingItem.destroy({ where: { draftId: draft.id }, transaction: t }),
      DraftProductItem.destroy({ where: { draftId: draft.id }, transaction: t }),
      DraftBeverageItem.destroy({ where: { draftId: draft.id }, transaction: t }),
    ]);

    if (courts.length) await DraftBookingItem.bulkCreate(courts, { transaction: t });
    if (products.length) await DraftProductItem.bulkCreate(products, { transaction: t });
    if (beverages.length) await DraftBeverageItem.bulkCreate(beverages, { transaction: t });

    await draft.update(
      {
        nameCustomer: nameCustomer?.trim() || draft.nameCustomer,
        phoneNumber: phoneNumber?.trim() || draft.phoneNumber,
        note,
        totalAmount,
      },
      { transaction: t },
    );

    await t.commit();

    const updated = await DraftBooking.findByPk(draft.id, { include: draftInclude });
    return mapDraft(updated);
  } catch (error) {
    await t.rollback();
    if (error instanceof ApiError) throw error;
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};

const deleteDraftService = async (employeeId, draftId) => {
  const t = await sequelize.transaction();

  try {
    const session = await getActiveSession(employeeId, t);
    assertCashier(session);
    const draft = await findDraftForEmployee({ draftId, session, transaction: t });

    if (draft.draftBookingStatus !== DRAFT_BOOKING_STATUS.DRAFT) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Không thể xoá đơn đã hoàn tất.");
    }

    await draft.destroy({ transaction: t });
    await t.commit();
  } catch (error) {
    await t.rollback();
    if (error instanceof ApiError) throw error;
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};

const checkoutDraftService = async ({ employeeId, draftId, paymentMethod }) => {
  const t = await sequelize.transaction();

  try {
    const session = await getActiveSession(employeeId, t);
    assertCashier(session);
    const draft = await findDraftForEmployee({ draftId, session, transaction: t });

    if (draft.draftBookingStatus !== DRAFT_BOOKING_STATUS.DRAFT) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Đơn tạm không còn ở trạng thái mở.");
    }

    if (!draft.courtItems.length && !draft.productItems.length && !draft.beverageItems.length) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Đơn tạm chưa có mặt hàng hoặc sân.");
    }

    for (const item of draft.productItems) {
      await VariantStock.decrement(
        { stock: Number(item.quantity) },
        {
          where: {
            branchId: session.workShift.branchId,
            variantId: item.productVariantId,
          },
          transaction: t,
        },
      );
    }

    for (const item of draft.beverageItems) {
      await Beverage.decrement(
        { stock: Number(item.quantity) },
        { where: { id: item.beverageId }, transaction: t },
      );
    }

    await draft.update(
      { draftBookingStatus: DRAFT_BOOKING_STATUS.COMPLETED },
      { transaction: t },
    );

    const offlineBooking = await OfflineBooking.create(
      {
        draftId: draft.id,
        paymentMethod,
        paymentStatus: PAYMENT_STATUS.PAID,
        totalAmount: Number(draft.totalAmount || 0),
        paidAt: new Date(),
      },
      { transaction: t },
    );

    await Payment.create(
      {
        paymentAmount: Number(draft.totalAmount || 0),
        paymentMethod,
        paymentStatus: PAYMENT_STATUS.PAID,
        targetPaymentType: TARGET_PAYMENT_TYPE.BOOKING,
        targetPaymentId: offlineBooking.id,
        paidAt: new Date(),
      },
      { transaction: t },
    );

    if (paymentMethod === PAYMENT_OFFLINE_METHOD_STATUS.CASH) {
      await session.cashRegister.increment(
        { expectedCash: Number(draft.totalAmount || 0) },
        { transaction: t },
      );
    }

    await t.commit();

    const updated = await DraftBooking.findByPk(draft.id, { include: draftInclude });
    return mapDraft(updated);
  } catch (error) {
    await t.rollback();
    if (error instanceof ApiError) throw error;
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};

const counterService = {
  getSessionService,
  getProductsService,
  getBeveragesService,
  getCourtBoardService,
  getDraftsService,
  createDraftService,
  updateDraftService,
  deleteDraftService,
  checkoutDraftService,
};

export default counterService;
