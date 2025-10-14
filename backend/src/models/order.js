import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Order = sequelize.define(
  "Order",
  {
    orderStatus: {
      type: DataTypes.ENUM("Pending", "Paid", "Cancelled"),
      allowNull: false,
      defaultValue: "Pending", // trạng thái mặc định khi tạo đơn
    },
    totalAmount: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      references: { model: "Users", key: "id" },
      allowNull: false,
    },
    discountId: {
      type: DataTypes.INTEGER,
      references: { model: "Discounts", key: "id" },
      allowNull: true, // nên cho phép null vì không phải đơn nào cũng có mã giảm
    },
    note: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    cancelledBy: {
      type: DataTypes.ENUM("User", "Admin", "System"),
      allowNull: true,
    },
  },
  {
    tableName: "Orders",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",
  }
);

export default Order;
