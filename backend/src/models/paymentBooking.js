import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import {
  PAYMENT_METHOD_STATUS,
  PAYMENT_STATUS,
} from "../constants/paymentConstant.js";

const PaymentBooking = sequelize.define(
  "PaymentBooking",
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
      allowNull: false,
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
    bookingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Bookings", key: "id" },
      onDelete: "CASCADE",
      validate: {
        isInt: {
          msg: "Booking ID must be an integer",
        },
        min: {
          args: [1],
          msg: "Booking ID must be a positive number",
        },
      },
    },
  },
  {
    tableName: "PaymentBookings",
    timestamps: false,
  },
);

export default PaymentBooking;
