import { DAY_OF_WEEK } from "../../constants/courtConstant.js";
import { Court, CourtPrice, CourtSchedule } from "../../models/index.js";

const getCourtScheduleByDateService = async (data) => {
  const { date } = data;

  const isoDate = date ?? new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD

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

  // Map getDay() → DAY_OF_WEEK
  const targetDate = new Date(isoDate);
  const dayOfWeekMap = [
    DAY_OF_WEEK.SUNDAY,
    DAY_OF_WEEK.MONDAY,
    DAY_OF_WEEK.TUESDAY,
    DAY_OF_WEEK.WEDNESDAY,
    DAY_OF_WEEK.THURSDAY,
    DAY_OF_WEEK.FRIDAY,
    DAY_OF_WEEK.SATURDAY,
  ];

  const dayOfWeek = dayOfWeekMap[targetDate.getDay()];

  const courtPrices = await CourtPrice.findAll({
    where: { dayOfWeek },
    attributes: ["startTime", "endTime", "price"],
  });

  return courtSchedules.map((cs) => {
    const priceObj = courtPrices.find(
      (p) => cs.startTime >= p.startTime && cs.endTime <= p.endTime,
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
};

const courtService = {
  getCourtScheduleByDateService,
};
export default courtService;
