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
    totalAmount: { type: DataTypes.DOUBLE, allowNull: false },
    userId: {
      type: DataTypes.INTEGER,
      references: { model: "Users", key: "id" },
      allowNull: false,
    },
    discountId: {
      type: DataTypes.INTEGER,
      references: { model: "Discounts", key: "id" },
      allowNull: true,
    },
    note: { type: DataTypes.STRING(1000), allowNull: true }, // giữ note ở đây
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
