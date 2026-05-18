import { Court, BookingDetail, CourtPrice } from "../../models/index.js";
import { Op } from "sequelize";
import NotFoundError from "../../errors/NotFoundError.js";
import BadRequestError from "../../errors/BadRequestError.js";

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

const assertBookableStartTime = ({ date, startTime }) => {
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

const getAvailableCourtsService = async (data) => {
  const { branchId, date, startTime, endTime } = data;

  const timeToNum = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h + m / 60;
  };

  const startNum = timeToNum(startTime);
  const endNum = timeToNum(endTime);
  if (endNum <= startNum) {
    throw new BadRequestError("Gio ket thuc phai sau gio bat dau");
  }

  assertBookableStartTime({ date, startTime });

  const days = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];
  const dayOfWeek = days[new Date(date).getDay()];

  // 1. Tính toán tiền cộng dồn (như cũ)
  const priceConfigs = await CourtPrice.findAll({
    where: {
      branchId,
      dayOfWeek,
      [Op.and]: [
        { startTime: { [Op.lt]: endTime } },
        { endTime: { [Op.gt]: startTime } },
      ],
    },
  });

  let totalCalculatedPrice = 0;
  let totalDurationFound = 0;
  priceConfigs.forEach((config) => {
    const overlapStart = Math.max(startNum, timeToNum(config.startTime));
    const overlapEnd = Math.min(endNum, timeToNum(config.endTime));
    if (overlapEnd > overlapStart) {
      totalCalculatedPrice += (overlapEnd - overlapStart) * config.price;
      totalDurationFound += overlapEnd - overlapStart;
    }
  });

  if (totalDurationFound < endNum - startNum - 0.01) {
    throw new Error("Sân không hoạt động hoặc chưa có giá trong khung giờ này");
  }

  // 2. Lấy danh sách các CourtId đã bị đặt (Dùng logic Overlap)
  const bookedDetails = await BookingDetail.findAll({
    where: {
      playDate: date,
      [Op.and]: [
        { startTime: { [Op.lt]: endTime } }, // Giờ bắt đầu của người đặt trước < Giờ kết thúc của bạn
        { endTime: { [Op.gt]: startTime } }, // Giờ kết thúc của người đặt trước > Giờ bắt đầu của bạn
      ],
    },
    attributes: ["courtId"],
  });

  const bookedCourtIds = bookedDetails.map((item) => item.courtId);

  // 3. Lấy TẤT CẢ các sân đang hoạt động của chi nhánh
  const allCourts = await Court.findAll({
    where: {
      branchId,
      courtStatus: "ACTIVE",
    },
    attributes: ["id", "courtName", "location", "thumbnailUrl"],
  });

  // 4. Map dữ liệu để trả về trạng thái "available" hoặc "booked"
  return allCourts.map((court) => {
    const isBooked = bookedCourtIds.includes(court.id);
    return {
      id: court.id,
      courtName: court.courtName,
      location: court.location,
      thumbnailUrl: court.thumbnailUrl,
      totalPrice: Math.round(totalCalculatedPrice),
      duration: (endNum - startNum).toFixed(1),
      // Thêm trường status này để UI xử lý 👇
      status: isBooked ? "booked" : "ACTIVE",
    };
  });
};

const getCourtByIdService = async (courtId) => {
  const court = await Court.findByPk(courtId);
  if (!court) throw new NotFoundError("Không tìm thấy thông tin sân");
  return court;
};
const getCourtsService = async (query) => {
  // Query hỗ trợ:
  // - /user/courts                 -> lấy tất cả sân
  // - /user/courts?ids=1,2,3       -> lấy theo danh sách id
  const rawIds = typeof query.ids === "string" ? query.ids : "";
  const ids = rawIds
    .split(",")
    .map((v) => Number(v.trim()))
    .filter((v) => Number.isInteger(v) && v > 0);

  const where = {};
  if (ids.length > 0) {
    where.id = { [Op.in]: ids };
  }

  const courts = await Court.findAll({
    where,
    attributes: ["id", "branchId", "courtName", "location"],
    order: [["id", "ASC"]],
  });

  return courts;
};
export default {
  getAvailableCourtsService,
  getCourtByIdService,
  getCourtsService,
};
