import { Op } from "sequelize";
import { StatusCodes } from "http-status-codes";
import {
  Order,
  OrderDetail,
  ProductVarient,
  Product,
  Payment,
  User,
  Profile,
} from "../../models/index.js";
import ApiError from "../../utils/ApiError.js";
import { sendUserNotification } from "../../utils/sendNotification.js";

const getOrdersService = async (
  orderStatus,
  keyword,
  date,
  page = 1,
  limit = 5
) => {
  try {
    const where = {};

    const p = page && page !== "null" ? parseInt(page) : 1;
    const l = limit && limit !== "null" ? parseInt(limit) : 10;
    const offset = (p - 1) * l;

    // Filter trạng thái
    if (orderStatus) {
      where.orderStatus = orderStatus;
    }

    // Filter ngày
    if (date) {
      const startOfDayVN = new Date(`${date}T00:00:00`);
      const endOfDayVN = new Date(`${date}T23:59:59`);

      const startOfDayUTC = new Date(
        startOfDayVN.getTime() - 7 * 60 * 60 * 1000
      );
      const endOfDayUTC = new Date(endOfDayVN.getTime() - 7 * 60 * 60 * 1000);

      where.createdDate = {
        [Op.between]: [startOfDayUTC, endOfDayUTC],
      };
    }

    // Filter theo keyword
    const userInclude = {
      model: User,
      as: "user",
      attributes: ["username"],
      required: keyword ? true : false, // bắt buộc join khi tìm keyword
      include: [
        {
          model: Profile,
          attributes: ["fullName", "address", "phoneNumber"],
          required: keyword ? true : false,
          where: keyword
            ? {
                [Op.or]: [
                  { fullName: { [Op.like]: `%${keyword}%` } },
                  { phoneNumber: { [Op.like]: `%${keyword}%` } },
                ],
              }
            : undefined,
        },
      ],
    };

    const { rows, count } = await Order.findAndCountAll({
      where,
      attributes: ["id", "orderStatus", "totalAmount", "note", "createdDate"],
      include: [
        {
          model: OrderDetail,
          as: "orderDetails",
          attributes: ["id", "quantity", "subTotal"],
          include: [
            {
              model: ProductVarient,
              as: "varient",
              attributes: ["id", "color", "size", "material"],
              include: [
                {
                  model: Product,
                  as: "product",
                  attributes: ["productName", "thumbnailUrl"],
                },
              ],
            },
          ],
        },
        {
          model: Payment,
          as: "payment",
          attributes: ["paymentMethod"],
        },
        userInclude,
      ],
      limit: l,
      offset,
      order: [["createdDate", "DESC"]],
    });

    return {
      orders: rows,
      total: count,
      page: p,
      limit: l,
    };
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const confirmedOrderService = async (orderId) => {
  try {
    const order = await Order.findByPk(orderId);
    if (!order) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Đơn hàng không tồn tại!");
    }
    if (order.orderStatus === "Cancelled") {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Đơn hàng đã hủy không thể xác nhận lại được nữa! Vui lòng đặt hàng lại!"
      );
    } else if (order.orderStatus === "Completed") {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Đơn hàng đã hoàn thành không thể xác nhận lại được nữa! Vui lòng đặt hàng lại!"
      );
    }

    await order.update({
      orderStatus: "Confirmed",
    });

    // update lại số lượng sản phẩm khi xác nhận
    const details = await OrderDetail.findAll({
      where: { orderId },
      attributes: ["varientId", "quantity"],
    });

    // increment() dùng để tăng hoặc giảm giá trị một cột (như stock) trực tiếp trong DB.
    await Promise.all(
      details.map(async ({ varientId, quantity }) => {
        await ProductVarient.increment(
          { stock: -quantity },
          { where: { id: varientId } }
        );
      })
    );

    await sendUserNotification(
      order.userId,
      "epl-confirm-order",
      "Đơn hàng đã được xác nhận",
      `Đơn hàng #0${orderId} đã được xác nhận. B-Hub đang chuẩn bị để giao đến bạn nhanh nhất!`
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const completedOrderService = async (orderId) => {
  try {
    const order = await Order.findByPk(orderId);
    if (!order) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Đơn hàng không tồn tại!");
    }
    if (order.orderStatus !== "Confirmed") {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Đơn hàng không thể hoàn thành nếu đơn hàng chưa được xác nhận! Vui lòng kiểm tra lại!"
      );
    }
    const payment = await Payment.findOne({
      where: { orderId: order.id, paymentMethod: "COD" },
    });

    await order.update({
      orderStatus: "Completed",
    });

    if (payment) {
      await payment.update({
        paymentStatus: "Success",
        paidAt: new Date(),
      });
    }

    await sendUserNotification(
      order.userId,
      "epl-complete-order",
      "Đơn hàng đã hoàn thành",
      `Đơn hàng #0${orderId} đã được hoàn thành. Cảm ơn bạn đã mua hàng tại B-Hub.`
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const cancelOrderService = async (orderId, cancelReason) => {
  try {
    const order = await Order.findByPk(orderId);
    if (!order) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Đơn hàng không tồn tại!");
    }
    if (order.orderStatus === "Completed") {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Đơn hàng đã hoàn thành không thể hủy!"
      );
    }

    const payment = await Payment.findOne({ where: { orderId } });

    const oldStatus = order.orderStatus;

    // xử lý payment trước
    if (oldStatus === "Pending") {
      await payment.update({ paymentStatus: "Cancelled" });
    } else if (oldStatus === "Paid") {
      await payment.update({
        paymentStatus: "Cancelled",
        refundAmount: payment.paymentAmount,
        refundAt: new Date(),
      });
    } else if (oldStatus === "Confirmed") {
      if (payment.paymentMethod === "COD") {
        await payment.update({ paymentStatus: "Cancelled" });
      } else {
        await payment.update({
          paymentStatus: "Cancelled",
          refundAmount: payment.paymentAmount,
          refundAt: new Date(),
        });
      }
    }

    // rồi mới update trạng thái order
    await order.update({
      orderStatus: "Cancelled",
      cancelledBy: "Employee",
      cancelReason,
    });

    // update lại số lượng sản phẩm khi hủy đơn
    const details = await OrderDetail.findAll({
      where: { orderId },
      attributes: ["varientId", "quantity"],
    });

    await Promise.all(
      details.map(async ({ varientId, quantity }) => {
        await ProductVarient.increment(
          { stock: +quantity },
          { where: { id: varientId } }
        );
      })
    );

    await sendUserNotification(
      order.userId,
      "epl-cancel-order",
      "Đơn hàng đã bị hủy",
      `Đơn hàng #0${orderId} đã được cửa hàng hủy theo yêu cầu của khách hàng.`
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const orderService = {
  getOrdersService,
  confirmedOrderService,
  completedOrderService,
  cancelOrderService,
};
export default orderService;
