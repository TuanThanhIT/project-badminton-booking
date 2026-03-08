import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const BookingDetail = sequelize.define(
  "BookingDetail",
  {
    bookingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Bookings", key: "id" },
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
    courtScheduleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "CourtSchedules", key: "id" },
      validate: {
        isInt: {
          msg: "Court schedule ID must be an integer",
        },
        min: {
          args: [1],
          msg: "Court schedule ID must be a positive number",
        },
      },
    },
  },
  {
    tableName: "BookingDetails",
    timestamps: false,
  },
);

export default BookingDetail;
