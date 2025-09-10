import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Booking = sequelize.define(
  "Booking",
  {
    status: { type: DataTypes.STRING(255), allowNull: false },
    bookingDate: { type: DataTypes.DATEONLY, allowNull: false },
    startTime: { type: DataTypes.TIME, allowNull: false },
    endTime: { type: DataTypes.TIME, allowNull: false },
    notes: { type: DataTypes.STRING(1000) },
    userId: {
      type: DataTypes.INTEGER,
      references: { model: "Users", key: "id" },
      allowNull: false,
    },
  },
  {
    tableName: "Bookings",
    timestamps: true,
    createdAt: "createdDate", // đổi tên createdAt
    updatedAt: "updatedDate", // đổi tên updatedAt
  }
);
export default Booking;
