import { StatusCodes } from "http-status-codes";
import { Court, CourtSchedule } from "../../models/index.js";
import ApiError from "../../utils/ApiError.js";

const getCourtScheduleByDateService = async (date) => {
  try {
    const where = {};
    if (date) {
      where.date = date;
    } else {
      const today = new Date();
      const isoDate = today.toISOString().split("T")[0];
      where.date = isoDate;
    }
    const courtSchedules = await CourtSchedule.findAll({
      where,
      attributes: ["id", "date", "startTime", "endTime", "isAvailable"],
      include: [
        {
          model: Court,
          as: "court",
          attributes: ["name"],
        },
      ],
    });
    return courtSchedules;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const courtService = {
  getCourtScheduleByDateService,
};
export default courtService;
