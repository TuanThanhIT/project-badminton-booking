import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Order = sequelize.define(
  "Order",
  {
    orderStatus: {
      type: DataTypes.ENUM(
        "Pending", // Đơn mới được đặt, chưa xác nhận
        "Confirmed", // Nhân viên đã xác nhận, chuẩn bị giao hàng
        "Paid", // Đã thanh toán (Momo hoặc COD)
        "Completed", // Đã giao thành công, hoàn tất
        "Cancelled" // Đơn đã bị hủy
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
    note: { type: DataTypes.STRING(255), allowNull: true },
    cancelledBy: {
      type: DataTypes.ENUM("User", "Employee", "System"),
      allowNull: true,
    },
    cancelReason: { type: DataTypes.STRING(255), allowNull: true },
  },
  {
    tableName: "Orders",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",
  }
);

export default Order;
