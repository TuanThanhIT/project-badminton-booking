import { col, fn, Op } from "sequelize";
import { StatusCodes } from "http-status-codes";
import { Order } from "../../models/index.js";
import ApiError from "../../utils/ApiError.js";

const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Paid",
  "Completed",
  "Cancelled",
];

const countOrderByOrderStatusService = async (date) => {
  try {
    // Parse ngày theo giờ Việt Nam
    const targetDate = date
      ? new Date(`${date}T00:00:00+07:00`)
      : new Date(
          new Date().toLocaleString("en-US", {
            timeZone: "Asia/Ho_Chi_Minh",
          })
        );

    // Start & End của NGÀY VIỆT NAM
    const startVN = new Date(targetDate);
    startVN.setHours(0, 0, 0, 0);

    const endVN = new Date(targetDate);
    endVN.setHours(23, 59, 59, 999);

    // KHÔNG trừ 7 tiếng nữa
    const result = await Order.findAll({
      attributes: ["orderStatus", [fn("COUNT", col("id")), "count"]],
      where: {
        createdDate: {
          [Op.between]: [startVN, endVN],
        },
      },
      group: ["orderStatus"],
      raw: true,
    });

    return ORDER_STATUSES.map((status) => {
      const found = result.find((r) => r.orderStatus === status);
      return {
        status,
        count: found ? Number(found.count) : 0,
      };
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message || error
    );
  }
};

const orderService = {
  countOrderByOrderStatusService,
};
export default orderService;
