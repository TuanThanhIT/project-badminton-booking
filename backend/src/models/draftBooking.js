import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import { DRAFT_BOOKING_STATUS } from "../constants/draftBookingConstant.js";

const DraftBooking = sequelize.define(
  "DraftBooking",
  {
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
    nameCustomer: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Customer name must not be empty",
        },
        len: {
          args: [2, 100],
          msg: "Customer name must be between 2 and 100 characters",
        },
      },
    },
    note: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        len: {
          args: [0, 500],
          msg: "Note must be at most 500 characters",
        },
      },
    },
    status: {
      type: DataTypes.ENUM(...Object.values(DRAFT_BOOKING_STATUS)),
      allowNull: false,
      defaultValue: DRAFT_BOOKING_STATUS.DRAFT,
    },
    total: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isFloat: {
          msg: "Total amount must be a number",
        },
        min: {
          args: [0],
          msg: "Total amount must be greater than or equal to 0",
        },
      },
    },
  },
  {
    tableName: "DraftBookings",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",
  },
);

export default DraftBooking;
