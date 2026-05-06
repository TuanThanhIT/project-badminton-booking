import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Booking from "./booking.js";
import Court from "./court.js";

const BookingDetail = sequelize.define(
  "BookingDetail",
  {
    bookingId: {
      type: DataTypes.INTEGER,
      allowNull: true, // ĐỔI THÀNH TRUE: Vì nếu là đặt tháng, buổi tập này sẽ link tới monthlyBookingId thay vì bookingId
      references: { model: Booking, key: "id" },
      validate: {
        isInt: { msg: "Booking ID must be an integer" },
      },
    },
    monthlyBookingId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Để null nếu là đặt lẻ, có giá trị nếu là đặt theo tháng
      references: { model: "MonthlyBookings", key: "id" },
      validate: {
        isInt: { msg: "Monthly Booking ID must be an integer" },
      },
    },
    courtId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Court, key: "id" },
      validate: {
        notNull: { msg: "Court ID is required" },
        isInt: { msg: "Court ID must be an integer" },
      },
    },
    playDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        notNull: { msg: "Play date is required" },
        isDate: { msg: "Play date must be a valid date" },
      },
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
      validate: {
        notNull: { msg: "Start time is required" },
        is: {
          args: /^([01]\d|2[0-3]):([0-5]\d)$/,
          msg: "Start time must be in HH:mm format",
        },
      },
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: false,
      validate: {
        notNull: { msg: "End time is required" },
        is: {
          args: /^([01]\d|2[0-3]):([0-5]\d)$/,
          msg: "End time must be in HH:mm format",
        },
      },
    },
    price: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      validate: {
        notNull: { msg: "Price is required" },
        isFloat: { msg: "Price must be a number" },
        min: { args: [0], msg: "Price cannot be negative" },
      },
    },
  },
  {
    tableName: "BookingDetails",
    timestamps: false,
  },
);

export default BookingDetail;
