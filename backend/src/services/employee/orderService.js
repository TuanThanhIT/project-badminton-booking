import { Op, or } from "sequelize";
import {
  Order,
  OrderDetail,
  ProductVarient,
  Product,
  Payment,
  User,
  Profile,
} from "../../models/index.js";
import {
  sendAdminNotification,
  sendUserNotification,
} from "../../utils/sendNotification.js";
import sequelize from "../../config/db.js";
import NotFoundError from "../../errors/NotFoundError.js";
import { ORDER_STATUS } from "../../constants/orderConstant.js";
import BadRequestError from "../../errors/BadRequestError.js";
import { handleSendOrderMail } from "../shared/sendOrderMail.js";
import {
  PAYMENT_METHOD_STATUS,
  PAYMENT_STATUS,
} from "../../constants/paymentConstant.js";

const getOrdersService = async (data) => {
  const { status: orderStatus, keyword, date, page, limit } = data;
  const where = {};

  const p = page ?? 1;
  const l = limit ?? 10;
  const offset = (p - 1) * l;

  // Filter trạng thái
  if (orderStatus) {
    where.orderStatus = orderStatus;
  }

  // Filter ngày – chuẩn giờ Việt Nam
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
};

const confirmedOrderService = async (data) => {
  const { orderId } = data;
  return sequelize.transaction(async (t) => {
    const order = await Order.findByPk(
      orderId,
      {
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
      },
      { transaction: t, lock: t.LOCK.UPDATE },
    );

    if (!order) throw new NotFoundError("Đơn hàng không tồn tại");

    if (order.orderStatus === ORDER_STATUS.CANCELLED)
      throw new BadRequestError("Đơn hàng đã bị hủy");
    if (order.orderStatus === ORDER_STATUS.COMPLETED)
      throw new BadRequestError("Đơn hàng đã hoàn thành");

    // cập nhật trạng thái
    await order.update(
      { orderStatus: ORDER_STATUS.CONFIRMED },
      { transaction: t },
    );

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
          { where: { id: varientId }, transaction: t },
        );
      }),
    );

    t.afterCommit(() => {
      sendUserNotification(
        order.userId,
        "us-confirm-order",
        "Đơn hàng đã được xác nhận",
        `Đơn hàng #0${orderId} đã được xác nhận.`,
      ).catch((err) => console.error("Customer notify failed", err));

      sendAdminNotification(
        "Đơn hàng đã được xác nhận",
        `Đơn hàng #0${orderId} đã được nhân viên xác nhận.`,
        "ADMIN",
        "adm-confirm-order",
      ).catch((err) => console.error("Admin notify failed", err));

      handleSendOrderMail(order, "confirm").catch((err) =>
        console.error("Customer mail failed", err),
      );
    });

    return order;
  });
};

const completedOrderService = async (data) => {
  const { orderId } = data;
  return sequelize.transaction(async (t) => {
    const order = await Order.findByPk(
      orderId,
      {
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
      },
      { transaction: t, lock: t.LOCK.UPDATE },
    );

    if (!order) throw new NotFoundError("Đơn hàng không tồn tại");

    if (order.orderStatus !== ORDER_STATUS.CONFIRMED)
      throw new BadRequestError("Đơn hàng chưa được xác nhận");

    // tìm payment (COD nếu có)
    const payment = await Payment.findOne({
      where: { orderId: order.id, paymentMethod: PAYMENT_METHOD_STATUS.COD },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    await order.update(
      { orderStatus: ORDER_STATUS.COMPLETED },
      { transaction: t },
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
          { stock: -quantity },
          { where: { id: varientId }, transaction: t },
        );
      }),
    );

    if (payment) {
      await payment.update(
        {
          paymentStatus: PAYMENT_STATUS.SUCCESS,
          paidAt: new Date(),
        },
        { transaction: t },
      );
    }

    t.afterCommit(() => {
      sendUserNotification(
        order.userId,
        "us-complete-order",
        "Đơn hàng đã hoàn thành",
        `Đơn hàng #0${orderId} đã được hoàn thành.`,
      ).catch((err) => console.error("Customer notify failed", err));

      sendAdminNotification(
        "Đơn hàng đã hoàn thành",
        `Đơn hàng #0${orderId} đã được hoàn thành`,
        "ADMIN",
        "adm-complete-order",
      ).catch((err) => console.error("Admin notify failed", err));

      handleSendOrderMail(order, "complete").catch((err) =>
        console.error("Customer mail failed"),
      );
    });

    return order;
  });
};

const cancelOrderService = async (data) => {
  const { orderId, cancelReason } = data;
  return sequelize.transaction(async (t) => {
    const order = await Order.findByPk(
      orderId,
      {
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
      },
      { transaction: t, lock: t.LOCK.UPDATE },
    );

    if (!order) throw new NotFoundError("Đơn hàng không tồn tại");

    if (order.orderStatus === ORDER_STATUS.COMPLETED)
      throw new BadRequestError("Đơn hàng đã hoàn thành không thể hủy");

    const payment = await Payment.findOne({
      where: { orderId },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    const oldStatus = order.orderStatus;

    // xử lý payment
    if (oldStatus === ORDER_STATUS.PENDING) {
      await payment.update(
        { paymentStatus: PAYMENT_STATUS.CANCELLED },
        { transaction: t },
      );
    } else if (oldStatus === ORDER_STATUS.PAID) {
      await payment.update(
        {
          paymentStatus: PAYMENT_STATUS.CANCELLED,
          refundAmount: payment.paymentAmount,
          refundAt: new Date(),
        },
        { transaction: t },
      );
    } else if (oldStatus === ORDER_STATUS.CONFIRMED) {
      if (payment.paymentMethod === PAYMENT_METHOD_STATUS.COD) {
        await payment.update(
          { paymentStatus: PAYMENT_STATUS.CANCELLED },
          { transaction: t },
        );
      } else {
        await payment.update(
          {
            paymentStatus: PAYMENT_STATUS.CANCELLED,
            refundAmount: payment.paymentAmount,
            refundAt: new Date(),
          },
          { transaction: t },
        );
      }
    }

    // update trạng thái order
    await order.update(
      {
        orderStatus: ORDER_STATUS.CANCELLED,
        cancelledBy: "Employee",
        cancelReason,
      },
      { transaction: t },
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
          { where: { id: varientId }, transaction: t },
        );
      }),
    );

    t.afterCommit(() => {
      sendUserNotification(
        order.userId,
        "us-cancel-order",
        "Đơn hàng đã bị hủy",
        `Đơn hàng #0${orderId} đã được cửa hàng hủy.`,
      ).catch((err) => console.error("Customer notify failed", err));

      sendAdminNotification(
        "Đơn hàng đã bị hủy",
        `Đơn hàng #0${orderId} đã được nhân viên hủy theo yêu cầu của khách hàng.`,
        "ADMIN",
        "adm-cancel-order",
      ).catch((err) => console.error("Admin notify failed", err));

      handleSendOrderMail(order, "cancel").catch((err) =>
        console.error("Customer mail failed", err),
      );
    });

    return order;
  });
};

const orderService = {
  getOrdersService,
  confirmedOrderService,
  completedOrderService,
  cancelOrderService,
};
export default orderService;
