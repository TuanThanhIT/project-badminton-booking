import { StatusCodes } from "http-status-codes";
import ApiError from "../../utils/ApiError.js";
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

const createOrderService = async (
  orderStatus,
  totalAmount,
  userId,
  code,
  note,
  orderDetails,
  paymentAmount,
  paymentMethod,
  paymentStatus
) => {
  const t = await sequelize.transaction();

  try {
    const status = ["Pending", "Paid", "Completed", "Cancelled"];
    if (!status.includes(orderStatus)) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Trạng thái đơn hàng không hợp lệ!"
      );
    }

    const user = await User.findByPk(userId, {
      include: [
        { model: Profile, attributes: ["fullName", "phoneNumber", "address"] },
      ],
    });

    if (!user?.Profile) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Thông tin giao hàng chưa được cập nhật!"
      );
    }

    const { fullName, address, phoneNumber } = user.Profile;

    if (!fullName)
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Tên khách hàng không hợp lệ!"
      );
    if (!address)
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Địa chỉ khách hàng không hợp lệ!"
      );
    if (!phoneNumber || !/^\d{10}$/.test(phoneNumber))
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Số điện thoại khách hàng không hợp lệ!"
      );

    let order;

    if (code) {
      const discount = await Discount.findOne({ where: { code } });

      if (!discount) {
        throw new ApiError(
          StatusCodes.NOT_FOUND,
          "Mã giảm giá không chính xác!"
        );
      }

      order = await Order.create(
        {
          orderStatus,
          totalAmount,
          userId,
          discountId: discount.id,
          note,
        },
        { transaction: t }
      );
    } else {
      order = await Order.create(
        {
          orderStatus,
          totalAmount,
          userId,
          note,
        },
        { transaction: t }
      );
    }

    const detailsWithOrderId = orderDetails.map((detail) => ({
      ...detail,
      orderId: order.id,
    }));

    await OrderDetail.bulkCreate(detailsWithOrderId, { transaction: t });

    const methods = ["COD", "MOMO"];
    if (!methods.includes(paymentMethod)) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Phương thức thanh toán không hợp lệ!"
      );
    }

    const pStatus = ["Pending", "Success", "Cancelled"];
    if (!pStatus.includes(paymentStatus)) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Trạng thái thanh toán không hợp lệ!"
      );
    }

    await Payment.create(
      {
        paymentAmount,
        paymentMethod,
        paymentStatus,
        orderId: order.id,
      },
      { transaction: t }
    );

    await t.commit();

    await sendEmployeesNotification(
      "Có đơn hàng mới",
      `Khách hàng vừa đặt đơn hàng #0${order.id}. Vui lòng kiểm tra và xác nhận đơn hàng.`,
      "EMPLOYEE",
      "epl-create-order"
    );

    await sendAdminNotification(
      "Có đơn hàng mới",
      `Khách hàng vừa đặt đơn hàng #0${order.id}. `,
      "ADMIN",
      "adm-create-order"
    );

    return order.id;
  } catch (error) {
    await t.rollback(); // rollback nếu có lỗi

    if (error instanceof ApiError) throw error;
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const getOrdersService = async (userId) => {
  try {
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
            })
          );
          orderData.orderDetails = newOrderDetails;
        }
        return orderData;
      })
    );

    return newOrders;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const cancelOrderService = async (orderId, body) => {
  const transaction = await sequelize.transaction();
  try {
    const { reason } = body;

    // Tìm order kèm payment
    const order = await Order.findByPk(orderId, {
      include: [{ model: Payment }],
      transaction,
      lock: true,
    });

    if (!order) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Đơn hàng không tồn tại");
    }

    if (order.status !== "PENDING") {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Chỉ có thể hủy đơn hàng đang ở trạng thái PENDING"
      );
    }

    // Update order → CANCELED
    await order.update(
      {
        status: "CANCELED",
        cancelReason: reason,
        cancelDate: new Date(),
      },
      { transaction }
    );

    // Update payment → FAILED nếu có
    if (order.Payment) {
      await order.Payment.update({ status: "FAILED" }, { transaction });
    }

    await transaction.commit();
    return { message: "Hủy đơn hàng thành công!" };
  } catch (error) {
    await transaction.rollback();
    if (error instanceof ApiError) throw error;
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const orderService = {
  createOrderService,
  getOrdersService,
  cancelOrderService,
};
export default orderService;
