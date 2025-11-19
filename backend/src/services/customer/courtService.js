import { StatusCodes } from "http-status-codes";
import ApiError from "../../utils/ApiError.js";
import { Court, CourtPrice, CourtSchedule } from "../../models/index.js";

const getCourtsService = async (date, page = 1, limit = 10) => {
  try {
    // ép tất cả case null/undefined/"null"/"" về default
    const p = page && page !== "null" ? parseInt(page) : 1;
    const l = limit && limit !== "null" ? parseInt(limit) : 10;

    const offset = (p - 1) * l;

    const { rows, count } = await Court.findAndCountAll({
      limit: l,
      offset,
      order: [["id", "ASC"]],
    });

    const formattedDate =
      date && date !== "null" ? date : new Date().toISOString().split("T")[0];

    const newCourts = await Promise.all(
      rows.map(async (court) => {
        const newCourt = court.toJSON();
        const availableSlots = await CourtSchedule.count({
          where: {
            isAvailable: true,
            date: formattedDate,
            courtId: newCourt.id,
          },
        });

        return {
          ...newCourt,
          date: formattedDate,
          availableSlots: availableSlots,
        };
      })
    );

    return {
      courts: newCourts,
      total: count,
      page: p,
      limit: l,
    };
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const getCourtScheduleService = async (courtId, date) => {
  try {
    const courtSchedule = await Court.findByPk(courtId, {
      include: [
        {
          model: CourtSchedule,
          as: "courtSchedules",
          where: { date },
          attributes: ["id", "startTime", "endTime", "isAvailable"],
        },
      ],
    });
    if (!courtSchedule) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Sân không tồn tại!");
    }
    return courtSchedule;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const getCourtPriceService = async () => {
  try {
    const courtPrices = await CourtPrice.findAll({
      attributes: ["dayOfWeek", "startTime", "endTime", "price", "periodType"],
    });
    return courtPrices;
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};
const courtService = {
  getCourtsService,
  getCourtScheduleService,
  getCourtPriceService,
};

export default courtService;
