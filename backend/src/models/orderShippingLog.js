import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import { SHIPPING_STATUS } from "../constants/orderConstant.js";
import Order from "./order.js";

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

export default OrderShippingLog;
