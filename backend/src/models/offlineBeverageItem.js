import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

// OfflineBeverageItem (nước đã thanh toán)
const OfflineBeverageItem = sequelize.define(
  "OfflineBeverageItem",
  {
    offlineBookingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "OfflineBookings", key: "id" },
    },
    beverageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Beverages", key: "id" },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    subTotal: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "OfflineBeverageItems",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",
  }
);

export default OfflineBeverageItem;
