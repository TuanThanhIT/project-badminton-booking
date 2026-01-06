import { StatusCodes } from "http-status-codes";
import ApiError from "../../utils/ApiError.js";
import { Court, CourtPrice, CourtSchedule } from "../../models/index.js";
import { Op } from "sequelize";

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
  try {
    const court = await Court.findByPk(courtId);
    if (!court) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy sân!");
    }
    await court.update(data);
    return {
      message: "Cập nhật sân thành công!",
      court,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const getAllCourtsService = async () => {
  try {
    return Court.findAll({
      order: [["name", "ASC"]],
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const getCourtByIdService = async (courtId) => {
  try {
    const court = await Court.findByPk(courtId);
    if (!court) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy sân!");
    }
    return court;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
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
    const timeRegex = /^\d{2}:\d{2}(:\d{2})?$/;

    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Định dạng giờ không hợp lệ!"
      );
    }

    if (!startTime.endsWith(":00") && !startTime.endsWith(":00:00")) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Giờ phải tròn giờ!");
    }
    if (startTime >= endTime) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Giờ kết thúc phải lớn hơn giờ bắt đầu!"
      );
    }
    const existed = await CourtPrice.findOne({
      where: {
        dayOfWeek,
        startTime,
        endTime,
        periodType,
      },
    });

    if (existed) {
      throw new ApiError(StatusCodes.CONFLICT, "Khung giờ này đã có giá!");
    }

    const result = await CourtPrice.create({
      dayOfWeek,
      startTime,
      endTime,
      price,
      periodType,
    });

    return {
      message: "Tạo giá cho tất cả sân thành công!",
      prices: [result],
    };
  } catch (error) {
    console.error("CREATE COURT PRICE ERROR:", error);
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

    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Ngày tạo phải ở định dạng YYYY-MM-DD"
      );
    }

    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "startDate không hợp lệ!");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Không thể tạo lịch cho ngày trong quá khứ!"
      );
    }

    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const courts = await Court.findAll({
      attributes: ["id"],
    });

    if (!courts.length) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Chưa có sân nào trong hệ thống!"
      );
    }

    const courtIds = courts.map((c) => c.id);

    const scheduledCourts = await CourtSchedule.findAll({
      attributes: ["courtId"],
      where: {
        courtId: {
          [Op.in]: courtIds,
        },
        date: {
          [Op.between]: [
            start.toISOString().split("T")[0],
            end.toISOString().split("T")[0],
          ],
        },
      },
      group: ["courtId"],
    });

    const scheduledCourtIds = scheduledCourts.map((s) => s.courtId);

    const availableCourts = courts.filter(
      (c) => !scheduledCourtIds.includes(c.id)
    );

    if (!availableCourts.length) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        "Tất cả sân đã có lịch trong tuần này!"
      );
    }

    const slots = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];

      for (const court of availableCourts) {
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

    return {
      message: "Tạo lịch tuần thành công!",
      createdCourts: availableCourts.length,
      skippedCourts: scheduledCourtIds.length,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
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
