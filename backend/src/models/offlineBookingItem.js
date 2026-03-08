import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

// OfflineBookingItem (Sân đã thanh toán)
const OfflineBookingItem = sequelize.define(
  "OfflineBookingItem",
  {
    offlineBookingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "OfflineBookings", key: "id" },
      validate: {
        isInt: {
          msg: "Offline booking ID must be an integer",
        },
        min: {
          args: [1],
          msg: "Offline booking ID must be a positive number",
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
    price: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      validate: {
        isFloat: {
          msg: "Price must be a number",
        },
        min: {
          args: [0],
          msg: "Price must be greater than or equal to 0",
        },
      },
    },
  },
  {
    tableName: "OfflineBookingItems",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",
  },
);

export default OfflineBookingItem;
