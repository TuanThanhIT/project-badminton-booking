import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Order = sequelize.define(
  "Order",
  {
    orderStatus: { type: DataTypes.STRING(255), allowNull: false },
    totalAmount: { type: DataTypes.DOUBLE, allowNull: false },
    userId: {
      type: DataTypes.INTEGER,
      references: { model: "User", key: "id" },
      allowNull: false,
    },
    discountId: {
      type: DataTypes.INTEGER,
      references: { model: "Discount", key: "id" },
      allowNull: false,
    },
  },
  {
    tableName: "Orders",
    timestamps: true, // bật tự động tạo
    createdAt: "createdDate", // đổi tên createdAt
    updatedAt: "updatedDate", // đổi tên updatedAt
  }
);
export default Order;
