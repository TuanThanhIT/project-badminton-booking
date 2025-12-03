import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

// OfflineBooking (Thanh toán tại quầy)
const OfflineBooking = sequelize.define(
  "OfflineBooking",
  {
    draftId: {
      type: DataTypes.INTEGER,
      references: { model: "DraftBookings", key: "id" },
      allowNull: false,
    },
    employeeId: {
      type: DataTypes.INTEGER,
      references: { model: "Users", key: "id" },
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.ENUM("Cash", "MOMO"),
      allowNull: true,
    },
    paymentStatus: {
      type: DataTypes.ENUM("Paid", "Pending"),
      defaultValue: "Pending",
      allowNull: false,
    },
    grandTotal: {
      type: DataTypes.DOUBLE,
      defaultValue: 0,
      allowNull: false,
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "OfflineBookings",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",
  }
);

export default OfflineBooking;
