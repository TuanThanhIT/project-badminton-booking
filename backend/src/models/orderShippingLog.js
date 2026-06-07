import { DataTypes, Op } from "sequelize";
import sequelize from "../config/db.js";
import { SHIPPING_STATUS } from "../constants/orderConstant.js";
import { syncOrderStatus } from "../utils/orderMapper.js";
import Order from "./order.js";

const SHIPPING_STATUS_RANK = Object.freeze({
  [SHIPPING_STATUS.PENDING]: 0,
  [SHIPPING_STATUS.CREATED]: 1,
  [SHIPPING_STATUS.PICKING]: 2,
  [SHIPPING_STATUS.PICKED]: 3,
  [SHIPPING_STATUS.IN_TRANSIT]: 4,
  [SHIPPING_STATUS.DELIVERING]: 5,
  [SHIPPING_STATUS.FAILED]: 6,
  [SHIPPING_STATUS.RETURNING]: 7,
  [SHIPPING_STATUS.RETURNED]: 8,
  [SHIPPING_STATUS.CANCELLED]: 8,
  [SHIPPING_STATUS.DELIVERED]: 9,
});

const getLogTimestamp = (log) => {
  const parsed = new Date(log.eventTime || log.createdAt).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

const shouldSkipStaleStatusUpdate = ({ currentStatus, nextStatus, previousLog, currentLog }) => {
  if (!previousLog) {
    return false;
  }

  if (getLogTimestamp(previousLog) <= getLogTimestamp(currentLog)) {
    return false;
  }

  return (
    (SHIPPING_STATUS_RANK[nextStatus] ?? 0) <=
    (SHIPPING_STATUS_RANK[currentStatus] ?? 0)
  );
};

const OrderShippingLog = sequelize.define(
  "OrderShippingLog",
  {
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Order, key: "id" },
      validate: {
        notNull: { msg: "Order ID is required" },
        isInt: { msg: "Order ID must be an integer" },
        min: {
          args: [1],
          msg: "Order ID must be positive",
        },
      },
    },

    status: {
      type: DataTypes.ENUM(...Object.values(SHIPPING_STATUS)),
      allowNull: false,
      validate: {
        notNull: { msg: "Shipping status is required" },
        isIn: {
          args: [Object.values(SHIPPING_STATUS)],
          msg: "Invalid shipping status",
        },
      },
    },

    description: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        len: {
          args: [0, 500],
          msg: "Description must be at most 500 characters",
        },
      },
    },

    eventTime: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: {
          msg: "Event time must be a valid date",
        },
      },
    },

    rawData: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    tableName: "OrderShippingLogs",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: false, // log không cần update

    indexes: [
      { fields: ["orderId"] },
      { fields: ["status"] },
      { fields: ["createdAt"] },

      // chống duplicate webhook
      {
        unique: true,
        fields: ["orderId", "status", "eventTime"],
      },
    ],
  },
);

const syncOrderFromShippingLog = async (log, options) => {
  if (options.skipOrderStatusSync) {
    return;
  }

  const order = await Order.findByPk(log.orderId, {
    transaction: options.transaction,
  });

  if (!order) {
    return;
  }

  const previousLog = await OrderShippingLog.findOne({
    where: {
      orderId: log.orderId,
      id: { [Op.ne]: log.id },
    },
    order: [
      ["eventTime", "DESC"],
      ["createdAt", "DESC"],
    ],
    transaction: options.transaction,
  });

  if (
    shouldSkipStaleStatusUpdate({
      currentStatus: order.shippingStatus,
      nextStatus: log.status,
      previousLog,
      currentLog: log,
    })
  ) {
    return;
  }

  const orderStatus = syncOrderStatus(log.status);

  await order.update(
    {
      shippingStatus: log.status,
      orderStatus: orderStatus || order.orderStatus,
      deliveredAt:
        log.status === SHIPPING_STATUS.DELIVERED
          ? log.eventTime || new Date()
          : order.deliveredAt,
    },
    { transaction: options.transaction },
  );
};

OrderShippingLog.addHook("afterCreate", syncOrderFromShippingLog);

OrderShippingLog.addHook("afterUpdate", syncOrderFromShippingLog);

export default OrderShippingLog;
