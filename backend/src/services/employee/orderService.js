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
import {
  sendAdminNotification,
  sendUserNotification,
} from "../../utils/sendNotification.js";
import mailer from "../../utils/mailer.js";
import sequelize from "../../config/db.js";

const handleSendOrderMail = (order, type) => {
  const orderProducts = order.orderDetails.map((item) => {
    return {
      productName: item.varient.product.productName,
      color: item.varient.color,
      size: item.varient.size,
      material: item.varient.material,
      quantity: item.quantity,
      subTotal: item.subTotal,
    };
  });

  const totalAmount = order.totalAmount;
  const email = order.user.email;

  return mailer.sendOrderMail(email, orderProducts, totalAmount, type);
};

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

    // ✅ Filter ngày – chuẩn giờ Việt Nam
    if (date) {
      const startVN = new Date(`${date}T00:00:00+07:00`);
      const endVN = new Date(`${date}T23:59:59.999+07:00`);

      where.createdDate = {
        [Op.between]: [startVN, endVN],
      };
    }

    // Filter keyword
    const userInclude = {
      model: User,
      as: "user",
      attributes: ["username"],
      required: !!keyword,
      include: [
        {
          model: Profile,
          attributes: ["fullName", "address", "phoneNumber"],
          required: !!keyword,
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
  const t = await sequelize.transaction();

  try {
    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["email"],
        },
        {
          model: OrderDetail,
          as: "orderDetails",
          attributes: ["quantity", "subTotal"],
          include: [
            {
              model: ProductVarient,
              as: "varient",
              attributes: ["color", "size", "material"],
              include: [
                {
                  model: Product,
                  as: "product",
                  attributes: ["productName"],
                },
              ],
            },
          ],
        },
      ],
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!order)
      throw new ApiError(StatusCodes.NOT_FOUND, "Đơn hàng không tồn tại!");

    if (order.orderStatus === "Cancelled")
      throw new ApiError(StatusCodes.BAD_REQUEST, "Đơn hàng đã bị hủy!");

    if (order.orderStatus === "Completed")
      throw new ApiError(StatusCodes.BAD_REQUEST, "Đơn hàng đã hoàn thành!");

    // cập nhật trạng thái
    await order.update({ orderStatus: "Confirmed" }, { transaction: t });

    // trừ stock
    const details = await OrderDetail.findAll({
      where: { orderId },
      attributes: ["varientId", "quantity"],
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    await Promise.all(
      details.map(async ({ varientId, quantity }) => {
        await ProductVarient.increment(
          { stock: -quantity },
          { where: { id: varientId }, transaction: t }
        );
      })
    );

    await t.commit();

    // các tác vụ ngoài transaction
    await sendUserNotification(
      order.userId,
      "us-confirm-order",
      "Đơn hàng đã được xác nhận",
      `Đơn hàng #0${orderId} đã được xác nhận.`
    );

    await sendAdminNotification(
      "Đơn hàng đã được xác nhận",
      `Đơn hàng #0${orderId} đã được nhân viên xác nhận.`,
      "ADMIN",
      "adm-confirm-order"
    );

    await handleSendOrderMail(order, "confirm");
  } catch (error) {
    await t.rollback();
    if (error instanceof ApiError) throw error;
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const completedOrderService = async (orderId) => {
  const t = await sequelize.transaction();

  try {
    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["email"],
        },
        {
          model: OrderDetail,
          as: "orderDetails",
          attributes: ["quantity", "subTotal"],
          include: [
            {
              model: ProductVarient,
              as: "varient",
              attributes: ["color", "size", "material"],
              include: [
                {
                  model: Product,
                  as: "product",
                  attributes: ["productName"],
                },
              ],
            },
          ],
        },
      ],
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!order)
      throw new ApiError(StatusCodes.NOT_FOUND, "Đơn hàng không tồn tại!");

    if (order.orderStatus !== "Confirmed")
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Đơn hàng chưa được xác nhận!"
      );

    // tìm payment (COD nếu có)
    const payment = await Payment.findOne({
      where: { orderId: order.id, paymentMethod: "COD" },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    await order.update({ orderStatus: "Completed" }, { transaction: t });

    if (payment) {
      await payment.update(
        {
          paymentStatus: "Success",
          paidAt: new Date(),
        },
        { transaction: t }
      );
    }

    await t.commit();

    await sendUserNotification(
      order.userId,
      "us-complete-order",
      "Đơn hàng đã hoàn thành",
      `Đơn hàng #0${orderId} đã được hoàn thành.`
    );

    await sendAdminNotification(
      "Đơn hàng đã hoàn thành",
      `Đơn hàng #0${orderId} đã được hoàn thành`,
      "ADMIN",
      "adm-complete-order"
    );

    await handleSendOrderMail(order, "complete");
  } catch (error) {
    await t.rollback();
    if (error instanceof ApiError) throw error;
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const cancelOrderService = async (orderId, cancelReason) => {
  const t = await sequelize.transaction();

  try {
    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["email"],
        },
        {
          model: OrderDetail,
          as: "orderDetails",
          attributes: ["quantity", "subTotal"],
          include: [
            {
              model: ProductVarient,
              as: "varient",
              attributes: ["color", "size", "material"],
              include: [
                {
                  model: Product,
                  as: "product",
                  attributes: ["productName"],
                },
              ],
            },
          ],
        },
      ],
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!order)
      throw new ApiError(StatusCodes.NOT_FOUND, "Đơn hàng không tồn tại!");

    if (order.orderStatus === "Completed")
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Đơn hàng đã hoàn thành không thể hủy!"
      );

    const payment = await Payment.findOne({
      where: { orderId },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    const oldStatus = order.orderStatus;

    // xử lý payment
    if (oldStatus === "Pending") {
      await payment.update({ paymentStatus: "Cancelled" }, { transaction: t });
    } else if (oldStatus === "Paid") {
      await payment.update(
        {
          paymentStatus: "Cancelled",
          refundAmount: payment.paymentAmount,
          refundAt: new Date(),
        },
        { transaction: t }
      );
    } else if (oldStatus === "Confirmed") {
      if (payment.paymentMethod === "COD") {
        await payment.update(
          { paymentStatus: "Cancelled" },
          { transaction: t }
        );
      } else {
        await payment.update(
          {
            paymentStatus: "Cancelled",
            refundAmount: payment.paymentAmount,
            refundAt: new Date(),
          },
          { transaction: t }
        );
      }
    }

    // update trạng thái order
    await order.update(
      {
        orderStatus: "Cancelled",
        cancelledBy: "Employee",
        cancelReason,
      },
      { transaction: t }
    );

    // hoàn stock
    const details = await OrderDetail.findAll({
      where: { orderId },
      attributes: ["varientId", "quantity"],
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    await Promise.all(
      details.map(async ({ varientId, quantity }) => {
        await ProductVarient.increment(
          { stock: +quantity },
          { where: { id: varientId }, transaction: t }
        );
      })
    );

    await t.commit();

    await sendUserNotification(
      order.userId,
      "us-cancel-order",
      "Đơn hàng đã bị hủy",
      `Đơn hàng #0${orderId} đã được cửa hàng hủy.`
    );

    await sendAdminNotification(
      "Đơn hàng đã bị hủy",
      `Đơn hàng #0${orderId} đã được nhân viên hủy theo yêu cầu của khách hàng.`,
      "ADMIN",
      "adm-cancel-order"
    );

    await handleSendOrderMail(order, "cancel");
  } catch (error) {
    await t.rollback();
    if (error instanceof ApiError) throw error;
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
