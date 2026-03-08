import { Court, CourtPrice, CourtSchedule } from "../../models/index.js";
import BadRequestError from "../../errors/BadRequestError.js";

const getCourtsService = async (data) => {
  const { date, page, limit } = data;

  const p = page ?? 1;
  const l = limit ?? 10;

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
    }),
  );

  return {
    courts: newCourts,
    total: count,
    page: p,
    limit: l,
  };
};

const getCourtScheduleService = async (data) => {
  const { courtId, date } = data;
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
    throw new BadRequestError("Sân không tồn tại");
  }
  return courtSchedule;
};

const getCourtPriceService = async () => {
  const courtPrices = await CourtPrice.findAll({
    attributes: ["dayOfWeek", "startTime", "endTime", "price", "periodType"],
  });
  return courtPrices;
};

const courtService = {
  getCourtsService,
  getCourtScheduleService,
  getCourtPriceService,
};

export default courtService;
