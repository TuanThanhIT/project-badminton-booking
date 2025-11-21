import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const BookingDetail = sequelize.define(
  "BookingDetail",
  {
    bookingId: {
      type: DataTypes.INTEGER,
      references: { model: "Bookings", key: "id" },
      allowNull: false,
    },
    courtScheduleId: {
      type: DataTypes.INTEGER,
      references: { model: "CourtSchedules", key: "id" },
      allowNull: false,
    },
  },
  {
    tableName: "BookingDetails",
    timestamps: false,
  }
);

export default BookingDetail;
