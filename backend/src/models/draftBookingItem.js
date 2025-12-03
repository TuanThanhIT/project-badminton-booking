import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

// DraftBookingItem (Chọn sân tạm)
const DraftBookingItem = sequelize.define(
  "DraftBookingItem",
  {
    draftId: {
      type: DataTypes.INTEGER,
      references: { model: "DraftBookings", key: "id" },
      allowNull: false,
    },
    courtScheduleId: {
      type: DataTypes.INTEGER,
      references: { model: "CourtSchedules", key: "id" },
      allowNull: false,
    },
    price: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
  },
  {
    tableName: "DraftBookingItems",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",
  }
);
export default DraftBookingItem;
