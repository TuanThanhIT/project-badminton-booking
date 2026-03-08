import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import {
  PAYMENT_METHOD_STATUS,
  PAYMENT_STATUS,
} from "../constants/paymentConstant.js";

const OfflineBooking = sequelize.define(
  "OfflineBooking",
  {
    draftId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "DraftBookings", key: "id" },
      validate: {
        isInt: {
          msg: "Draft ID must be an integer",
        },
        min: {
          args: [1],
          msg: "Draft ID must be a positive number",
        },
      },
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Users", key: "id" },
      validate: {
        isInt: {
          msg: "Employee ID must be an integer",
        },
        min: {
          args: [1],
          msg: "Employee ID must be a positive number",
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
    grandTotal: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isFloat: {
          msg: "Grand total must be a number",
        },
        min: {
          args: [0],
          msg: "Grand total must be greater than or equal to 0",
        },
      },
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "OfflineBookings",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",
  },
);

export default OfflineBooking;
