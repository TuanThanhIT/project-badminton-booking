import { col, fn, Op } from "sequelize";
import { Order } from "../../models/index.js";
import { ORDER_STATUS } from "../../constants/orderConstant.js";

const countOrderByOrderStatusService = async ({ date }) => {
  const baseDate = date
    ? new Date(`${date}T00:00:00+07:00`)
    : new Date(
        new Date().toLocaleString("en-US", {
          timeZone: "Asia/Ho_Chi_Minh",
        }),
      );

  const startVN = new Date(baseDate);
  startVN.setHours(0, 0, 0, 0);

  const endVN = new Date(baseDate);
  endVN.setHours(23, 59, 59, 999);

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

  return Object.values(ORDER_STATUS).map((status) => {
    const found = result.find((r) => r.orderStatus === status);
    return {
      status,
      count: found ? Number(found.count) : 0,
    };
  });
};

const orderService = {
  countOrderByOrderStatusService,
};
export default orderService;
