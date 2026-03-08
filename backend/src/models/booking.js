import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import { BOOKING_STATUS } from "../constants/bookingConstant.js";

const Booking = sequelize.define(
  "Booking",
  {
    bookingStatus: {
      type: DataTypes.ENUM(...Object.values(BOOKING_STATUS)),
      allowNull: false,
      defaultValue: BOOKING_STATUS.PENDING,
      validate: {
        isIn: {
          args: [Object.values(BOOKING_STATUS)],
          msg: "Invalid booking status",
        },
      },
    },
    totalAmount: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      validate: {
        isFloat: {
          msg: "Total amount must be a number",
        },
        min: {
          args: [0.01],
          msg: "Total amount must be greater than 0",
        },
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Users", key: "id" },
      validate: {
        isInt: {
          msg: "User ID must be an integer",
        },
        min: {
          args: [1],
          msg: "User ID must be a positive number",
        },
      },
    },
    discountId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "DiscountBookings", key: "id" },
      validate: {
        isInt: {
          msg: "Discount ID must be an integer",
        },
        min: {
          args: [1],
          msg: "Discount ID must be a positive number",
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
    cancelledBy: {
      type: DataTypes.ENUM("User", "Employee", "System"),
      allowNull: true,
    },
    cancelReason: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        len: {
          args: [5, 500],
          msg: "Cancel reason must be between 5 and 500 characters",
        },
      },
    },
  },
  {
    tableName: "Bookings",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",
  },
);

export default Booking;
