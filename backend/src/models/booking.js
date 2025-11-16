import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Booking = sequelize.define(
  "Booking",
  {
    bookingStatus: {
      type: DataTypes.ENUM(
        "Pending", // Đặt mới
        "Confirmed", // Nhân viên xác nhận
        "Paid", // Đã thanh toán
        "Completed", // Đã kết thúc
        "Cancelled" // Hủy
      ),
      allowNull: false,
      defaultValue: "Pending",
    },
    bookingDate: { type: DataTypes.DATEONLY, allowNull: false },
    startTime: { type: DataTypes.TIME, allowNull: false },
    endTime: { type: DataTypes.TIME, allowNull: false },
    notes: { type: DataTypes.STRING(1000) },
    userId: {
      type: DataTypes.INTEGER,
      references: { model: "Users", key: "id" },
      allowNull: false,
    },
    courtId: {
      type: DataTypes.INTEGER,
      references: { model: "Courts", key: "id" },
      allowNull: false,
    },
    discountId: {
      type: DataTypes.INTEGER,
      references: { model: "Discounts", key: "id" },
      allowNull: true,
    },
    totalAmount: { type: DataTypes.DOUBLE, allowNull: false },
    cancelledBy: {
      type: DataTypes.ENUM("User", "Employee", "System"),
      allowNull: true,
    },
    cancelReason: { type: DataTypes.STRING(255), allowNull: true },
  },
  {
    tableName: "Bookings",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",
  }
);

export default Booking;
