import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import {
  PAYMENT_METHOD_STATUS,
  PAYMENT_STATUS,
} from "../constants/paymentConstant.js";

const Payment = sequelize.define(
  "Payment",
  {
    paymentAmount: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      validate: {
        isFloat: {
          msg: "Payment amount must be a number",
        },
        min: {
          args: [0],
          msg: "Payment amount must be greater than or equal to 0",
        },
      },
    },
    paymentMethod: {
      type: DataTypes.ENUM(...Object.values(PAYMENT_METHOD_STATUS)),
      allowNull: true,
      validate: {
        isIn: {
          args: [Object.values(PAYMENT_METHOD_STATUS)],
          msg: "Invalid payment method",
        },
      },
    },
    paymentStatus: {
      type: DataTypes.ENUM(...Object.values(PAYMENT_STATUS)),
      allowNull: false,
      defaultValue: PAYMENT_STATUS.PENDING,
      validate: {
        isIn: {
          args: [Object.values(PAYMENT_STATUS)],
          msg: "Invalid payment status",
        },
      },
    },
    transId: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [0, 255],
          msg: "Transaction ID must be at most 255 characters",
        },
      },
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    refundAmount: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      validate: {
        isFloat: {
          msg: "Refund amount must be a number",
        },
        min: {
          args: [0],
          msg: "Refund amount must be greater than or equal to 0",
        },
      },
    },
    refundAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Orders", key: "id" },
      onDelete: "CASCADE",
      validate: {
        isInt: {
          msg: "Order ID must be an integer",
        },
        min: {
          args: [1],
          msg: "Order ID must be a positive number",
        },
      },
    },
  },
  {
    tableName: "Payments",
    timestamps: false,
  },
);

export default Payment;
