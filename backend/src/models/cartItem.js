import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const CartItem = sequelize.define(
  "CartItem",
  {
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    subTotal: { type: DataTypes.DOUBLE, allowNull: false },
    cartId: {
      type: DataTypes.INTEGER,
      references: { model: "Carts", key: "id" },
      allowNull: false,
    },
  },
  {
    tableName: "CartItems",
    timestamps: false,
  }
);
export default CartItem;
