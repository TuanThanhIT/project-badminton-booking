import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import {
  PAYMENT_METHOD_STATUS,
  PAYMENT_OFFLINE_METHOD_STATUS,
  PAYMENT_STATUS,
} from "../constants/paymentConstant.js";
import DraftBooking from "./draftBooking.js";

const OfflineBooking = sequelize.define(
  "OfflineBooking",
  {
    draftId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: DraftBooking, key: "id" },
      validate: {
        notNull: {
          msg: "Draft ID is required",
        },
        isInt: {
          msg: "Draft ID must be an integer",
        },
        min: {
          args: [1],
          msg: "Draft ID must be a positive number",
        },
      },
    },
    paymentMethod: {
      type: DataTypes.ENUM(...Object.values(PAYMENT_OFFLINE_METHOD_STATUS)),
      allowNull: false,
      validate: {
        notNull: { msg: "Payment method is required" },
        isIn: {
          args: [Object.values(PAYMENT_OFFLINE_METHOD_STATUS)],
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
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        notNull: { msg: "Total amount is required" },
        isFloat: {
          msg: "Total amount must be a number",
        },
        min: {
          args: [0],
          msg: "Total amount must be greater than or equal to 0",
        },
      },
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: {
          msg: "PaidAt must be a valid date",
        },
      },
    },
  },
  {
    tableName: "OfflineBookings",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
);

export default OfflineBooking;
