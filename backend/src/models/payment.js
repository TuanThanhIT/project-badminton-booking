import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import {
  PAYMENT_METHOD_STATUS,
  PAYMENT_STATUS,
  TARGET_PAYMENT_TYPE,
} from "../constants/paymentConstant.js";

const Payment = sequelize.define(
  "Payment",
  {
    paymentAmount: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      validate: {
        notNull: { msg: "Payment amount is required" },
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
        notNull: { msg: "Payment status is required" },
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
      validate: {
        isDate: {
          msg: "paidAt must be a valid date",
        },
      },
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
      validate: {
        isDate: {
          msg: "refundAt must be a valid date",
        },
      },
    },
    targetPaymentType: {
      type: DataTypes.ENUM(...Object.values(TARGET_PAYMENT_TYPE)),
      allowNull: false,
      defaultValue: TARGET_PAYMENT_TYPE.ORDER,
      validate: {
        notNull: { msg: "Target payment type is required" },
        isIn: {
          args: [Object.values(TARGET_PAYMENT_TYPE)],
          msg: "Invalid target payment type",
        },
      },
    },
    targetPaymentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Target payment ID is required",
        },
        isInt: {
          msg: "Target payment ID must be an integer",
        },
        min: {
          args: [1],
          msg: "Target payment ID must be a positive number",
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
