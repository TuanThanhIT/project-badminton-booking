import { StatusCodes } from "http-status-codes";
import ApiError from "../../utils/ApiError.js";
import { Court, CourtPrice, CourtSchedule } from "../../models/index.js";
import { PawPrint } from "lucide-react";

const createCourtService = async (name, location, thumbnailUrl) => {
  try {
    const checkCourt = await Court.findOne({ where: { name } });
    if (checkCourt) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Sân đã tồn tại!");
    }
    const court = await Court.create({ name, location, thumbnailUrl });
    return court;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const updateCourtService = async (courtId, data) => {
  const court = await Court.findByPk(courtId);

  if (!court) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy sân!");
  }

  await court.update(data);

  return {
    message: "Cập nhật sân thành công!",
    court,
  };
};

const getAllCourtsService = async () => {
  return Court.findAll({
    order: [["name", "ASC"]],
  });
};

const getCourtByIdService = async (courtId) => {
  const court = await Court.findByPk(courtId);

  if (!court) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy sân!");
  }

  return court;
};

const createCourtPriceService = async (
  dayOfWeek,
  startTime,
  endTime,
  price,
  periodType
) => {
  try {
    const dayOfWeeks = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    const checkDay = dayOfWeeks.includes(dayOfWeek);
    if (!checkDay) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Thứ không hợp lệ!");
    }

    const periodTypes = ["Daytime", "Evening", "Weekend"];

    const checkPeriod = periodTypes.includes(periodType);
    if (!checkPeriod) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Giá trị của kiểu khung giờ không hợp lệ!"
      );
    }

    const courtPrice = await CourtPrice.create({
      dayOfWeek,
      startTime,
      endTime,
      price,
      periodType,
    });
    return courtPrice;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

export const createWeeklySlotsService = async (startDate) => {
  try {
    if (!startDate) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Ngày tạo là bắt buộc!");
    }

    // Validate định dạng YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Ngày tạo phải ở định dạng YYYY-MM-DD"
      );
    }

    const courts = await Court.findAll();

    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "startDate không hợp lệ!");
    }

    const slots = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD

      for (const court of courts) {
        for (let hour = 7; hour < 22; hour++) {
          slots.push({
            date: dateStr,
            startTime: `${hour.toString().padStart(2, "0")}:00:00`,
            endTime: `${(hour + 1).toString().padStart(2, "0")}:00:00`,
            courtId: court.id,
            isAvailable: true,
          });
        }
      }
    }

    await CourtSchedule.bulkCreate(slots);
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const courtService = {
  createCourtService,
  createCourtPriceService,
  createWeeklySlotsService,
  updateCourtService,
  getAllCourtsService,
  getCourtByIdService,
};
export default courtService;
