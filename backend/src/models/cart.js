import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Cart = sequelize.define(
  "Cart",
  {
    totalAmount: { type: DataTypes.DOUBLE, allowNull: true, defaultValue: 0 },
  },
  {
    tableName: "Carts",
    timestamps: true,
    createdAt: "createdDate", // đổi tên createdAt
    updatedAt: "updatedDate", // đổi tên updatedAt
  }
);
export default Cart;
