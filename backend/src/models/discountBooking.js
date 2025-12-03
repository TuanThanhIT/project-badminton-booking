import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const DiscountBooking = sequelize.define(
  "DiscountBooking",
  {
    code: { type: DataTypes.STRING, allowNull: false, unique: true },
    type: { type: DataTypes.ENUM("PERCENT", "AMOUNT"), allowNull: false },
    value: { type: DataTypes.DOUBLE, allowNull: false },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    isUsed: { type: DataTypes.BOOLEAN, defaultValue: false },
    startDate: { type: DataTypes.DATE, allowNull: false },
    endDate: { type: DataTypes.DATE, allowNull: false },
    minBookingAmount: { type: DataTypes.DOUBLE, allowNull: true },
  },
  {
    tableName: "DiscountBookings",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",
  }
);

export default DiscountBooking;
