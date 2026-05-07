import sequelize from "../../config/db.js";
import {
  ORDER_STATUS,
  SHIPPING_STATUS,
} from "../../constants/orderConstant.js";
import BadRequestError from "../../errors/BadRequestError.js";
import NotFoundError from "../../errors/NotFoundError.js";
import { Order, OrderShippingLog } from "../../models/index.js";
import { syncOrderStatus } from "../../utils/orderMapper.js";
import { mapGHNStatusToSystem } from "../../utils/shippingMapper.js";
import { createGHNOrderService } from "../shared/ghnService.js";

const confirmOrderService = async (data) => {
  const { orderId } = data;
  return sequelize.transaction(async (t) => {
    const order = await Order.findByPk(orderId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!order) throw new NotFoundError("Đơn hàng không tồn tại");

    if (order.orderStatus !== ORDER_STATUS.PENDING) {
      throw new BadRequestError("Sai trạng thái");
    }

    await order.update(
      { orderStatus: ORDER_STATUS.CONFIRMED },
      { transaction: t },
    );

    return order;
  });
};

const prepareOrderService = async (data) => {
  const { orderId } = data;
  return sequelize.transaction(async (t) => {
    const order = await Order.findByPk(orderId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (order.orderStatus !== ORDER_STATUS.CONFIRMED) {
      throw new BadRequestError("Chưa xác nhận");
    }

    await order.update(
      { orderStatus: ORDER_STATUS.PREPARING },
      { transaction: t },
    );

    return order;
  });
};

const readyToShipService = async (data) => {
  const { orderId } = data;
  return sequelize.transaction(async (t) => {
    const order = await Order.findByPk(orderId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (order.orderStatus !== ORDER_STATUS.PREPARING) {
      throw new BadRequestError("Chưa chuẩn bị xong");
    }

    await order.update(
      { orderStatus: ORDER_STATUS.READY_TO_SHIP },
      { transaction: t },
    );

    return order;
  });
};

const shipOrderService = async ({ orderId }) => {
  // 1. lock order
  const order = await sequelize.transaction(async (t) => {
    const o = await Order.findByPk(orderId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!o) throw new NotFoundError("Đơn hàng không tồn tại");

    if (o.orderStatus !== ORDER_STATUS.READY_TO_SHIP) {
      throw new BadRequestError("Chưa sẵn sàng giao");
    }

    if (o.shippingOrderCode) {
      throw new BadRequestError("Đơn đã tạo GHN rồi");
    }

    return o;
  });

  // 2. call GHN
  let ghn;
  try {
    ghn = await createGHNOrderService(order);
  } catch (err) {
    console.error("GHN ERROR:", err.message);

    await order.update({
      shippingStatus: SHIPPING_STATUS.FAILED,
    });

    throw err;
  }

  // 3. update DB atomic
  await sequelize.transaction(async (t) => {
    await order.update(
      {
        shippingOrderCode: ghn.order_code,
        shippingStatus: SHIPPING_STATUS.CREATED,
        orderStatus: ORDER_STATUS.SHIPPING,
        estimatedDelivery: ghn.expected_delivery_time,
        shippingFeeReal: ghn.total_fee,
      },
      { transaction: t },
    );

    await OrderShippingLog.create(
      {
        orderId: order.id,
        status: SHIPPING_STATUS.CREATED,
        eventTime: new Date(),
        rawData: ghn,
      },
      { transaction: t },
    );
  });

  return order;
};

const orderService = {
  confirmOrderService,
  prepareOrderService,
  readyToShipService,
  shipOrderService,
};

export default orderService;
