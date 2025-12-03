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
    },
    courtScheduleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "CourtSchedules", key: "id" },
    },
    price: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
  },
  {
    tableName: "OfflineBookingItems",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",
  }
);

export default OfflineBookingItem;
