import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./user.js";

const Cart = sequelize.define(
  "Cart",
  {
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        notNull: {
          msg: "Total amount is required",
        },
        isFloat: {
          msg: "Total amount must be a number",
        },
        min: {
          args: [0],
          msg: "Total amount must be greater than or equal to 0",
        },
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
      validate: {
        notNull: {
          msg: "User ID is required",
        },
        isInt: {
          msg: "User ID must be an integer",
        },
        min: {
          args: [1],
          msg: "User ID must be a positive number",
        },
      },
    },
  },
  {
    tableName: "Carts",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
);

export default Cart;
