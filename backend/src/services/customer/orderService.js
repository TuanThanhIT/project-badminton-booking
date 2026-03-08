import {
  Discount,
  Order,
  OrderDetail,
  Payment,
  Product,
  ProductVarient,
  User,
  ProductFeedback,
  Profile,
} from "../../models/index.js";
import {
  sendAdminNotification,
  sendEmployeesNotification,
} from "../../utils/sendNotification.js";
import sequelize from "../../config/db.js";
import BadRequestError from "../../errors/BadRequestError.js";
import NotFoundError from "../../errors/NotFoundError.js";
import { ORDER_STATUS } from "../../constants/orderConstant.js";

const createOrderService = async (data) => {
  const {
    orderStatus,
    totalAmount,
    userId,
    code,
    note,
    orderDetails,
    paymentAmount,
    paymentMethod,
    paymentStatus,
  } = data;

  return sequelize.transaction(async (t) => {
    const user = await User.findByPk(userId, {
      include: [
        { model: Profile, attributes: ["fullName", "phoneNumber", "address"] },
      ],
    });

    if (!user?.Profile) {
      throw new BadRequestError("Thông tin giao hàng chưa được cập nhật");
    }

    let order;

    if (code) {
      const discount = await Discount.findOne({
        where: { code },
        transaction: t,
      });

      if (!discount) {
        throw new BadRequestError("Mã giảm giá không chính xác");
      }

      order = await Order.create(
        {
          orderStatus,
          totalAmount,
          userId,
          discountId: discount.id,
          note,
        },
        { transaction: t },
      );
    } else {
      order = await Order.create(
        {
          orderStatus,
          totalAmount,
          userId,
          note,
        },
        { transaction: t },
      );
    }

    const detailsWithOrderId = orderDetails.map((detail) => ({
      ...detail,
      orderId: order.id,
    }));

    await OrderDetail.bulkCreate(detailsWithOrderId, { transaction: t });

    await Payment.create(
      {
        paymentAmount,
        paymentMethod,
        paymentStatus,
        orderId: order.id,
      },
      { transaction: t },
    );

    t.afterCommit(() => {
      sendEmployeesNotification(
        "Có đơn hàng mới",
        `Khách hàng vừa đặt đơn hàng #0${order.id}. Vui lòng kiểm tra và xác nhận đơn hàng.`,
        "EMPLOYEE",
        "epl-create-order",
      ).catch((err) => console.error("Employee notify failed", err));
      sendAdminNotification(
        "Có đơn hàng mới",
        `Khách hàng vừa đặt đơn hàng #0${order.id}. `,
        "ADMIN",
        "adm-create-order",
      ).catch((err) => console.error("Admin notify failed", err));
    });

    return order.id;
  });
};

const getOrdersService = async (data) => {
  const { userId } = data;
  const orders = await Order.findAll({
    where: {
      userId,
    },
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
    ],
    order: [["createdDate", "DESC"]],
  });

  const newOrders = await Promise.all(
    orders.map(async (order) => {
      const orderData = order.toJSON();
      if (orderData.orderStatus === "Completed") {
        const newOrderDetails = await Promise.all(
          orderData.orderDetails.map(async (orderDetail) => {
            const review = await ProductFeedback.findOne({
              where: { orderDetailId: orderDetail.id },
            });
            return {
              ...orderDetail,
              review: !!review,
            };
          }),
        );
        orderData.orderDetails = newOrderDetails;
      }
      return orderData;
    }),
  );

  return newOrders;
};

const cancelOrderService = async (data) => {
  const { orderId, cancelReason } = data;
  return sequelize.transaction(async (t) => {
    const order = await Order.findByPk(orderId, { transaction: t });
    if (!order) {
      throw new NotFoundError("Đơn hàng không tồn tại");
    }

    if (order.orderStatus === ORDER_STATUS.PAID) {
      throw new BadRequestError(
        "Đơn hàng đã thanh toán không thể hủy trực tiếp. Vui lòng liên hệ cửa hàng để hỗ trợ",
      );
    }

    if (order.orderStatus === ORDER_STATUS.CONFIRMED) {
      throw new BadRequestError(
        "Đơn hàng đã xác nhận không thể hủy trực tiếp. Vui lòng liên hệ cửa hàng để hỗ trợ",
      );
    }

    await order.update(
      {
        orderStatus: "Cancelled",
        cancelledBy: "User",
        cancelReason,
      },
      { transaction: t },
    );

    const payment = await Payment.findOne({
      where: { orderId },
      transaction: t,
    });

    if (payment) {
      await payment.update({ paymentStatus: "Cancelled" }, { transaction: t });
    }

    t.afterCommit(async () => {
      sendEmployeesNotification(
        "Đơn hàng đã bị hủy",
        `Khách hàng vừa hủy đơn #0${orderId}`,
        "EMPLOYEE",
        "epl-cancel-order",
      ).catch((err) => console.error("Employee notify failed", err));
      await sendAdminNotification(
        "Đơn hàng đã bị hủy",
        `Khách hàng vừa hủy đơn #0${orderId}`,
        "ADMIN",
        "adm-cancel-order",
      ).catch((err) => console.error("Admin notify failed", err));
    });
  });
};

const orderService = {
  createOrderService,
  getOrdersService,
  cancelOrderService,
};
export default orderService;
