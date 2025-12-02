import { StatusCodes } from "http-status-codes";
import { Court, CourtPrice, CourtSchedule } from "../../models/index.js";
import ApiError from "../../utils/ApiError.js";

const getCourtScheduleByDateService = async (date) => {
  try {
    const targetDate = date ? new Date(date) : new Date();
    const isoDate = targetDate.toISOString().split("T")[0];

    const courtSchedules = await CourtSchedule.findAll({
      where: { date: isoDate },
      attributes: [
        "id",
        "date",
        "startTime",
        "endTime",
        "isAvailable",
        "courtId",
      ],
      include: [
        {
          model: Court,
          as: "court",
          attributes: ["name"],
        },
      ],
    });

    if (courtSchedules.length === 0) return [];

    // Xác định ngày trong tuần
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayName = daysOfWeek[targetDate.getDay()];

    // Lấy tất cả giá sân trong ngày để tránh N+1 query
    const courtPrices = await CourtPrice.findAll({
      where: { dayOfWeek: dayName },
      attributes: ["startTime", "endTime", "price"],
    });

    const result = courtSchedules.map((cs) => {
      const priceObj = courtPrices.find(
        (p) => cs.startTime >= p.startTime && cs.endTime <= p.endTime
      );

      return {
        id: cs.id,
        date: cs.date,
        startTime: cs.startTime,
        endTime: cs.endTime,
        isAvailable: cs.isAvailable,
        court: cs.court,
        price: priceObj?.price ?? 0,
      };
    });

    return result;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const courtService = {
  getCourtScheduleByDateService,
};
export default courtService;
