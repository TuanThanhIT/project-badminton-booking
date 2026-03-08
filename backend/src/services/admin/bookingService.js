import { col, fn, Op } from "sequelize";
import { Booking } from "../../models/index.js";
import { BOOKING_STATUS } from "../../constants/bookingConstant.js";

const countBookingByBookingStatusService = async (data) => {
  const { date } = data;

  // Lấy ngày theo VN
  const baseDate = date
    ? new Date(`${date}T00:00:00`)
    : new Date(
        new Date().toLocaleString("en-US", {
          timeZone: "Asia/Ho_Chi_Minh",
        }),
      );

  const startVN = new Date(baseDate);
  startVN.setHours(0, 0, 0, 0);

  const endVN = new Date(baseDate);
  endVN.setHours(23, 59, 59, 999);

  const result = await Booking.findAll({
    attributes: ["bookingStatus", [fn("COUNT", col("id")), "count"]],
    where: {
      createdDate: {
        [Op.between]: [startVN, endVN],
      },
    },
    group: ["bookingStatus"],
    raw: true,
  });

  return Object.values(BOOKING_STATUS).map((status) => {
    const found = result.find((r) => r.bookingStatus === status);
    return {
      status,
      count: found ? Number(found.count) : 0,
    };
  });
};
const bookingService = {
  countBookingByBookingStatusService,
};
export default bookingService;
