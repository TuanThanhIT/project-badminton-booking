import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Cart = sequelize.define(
  "Cart",
  {
    totalAmount: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isFloat: {
          msg: "Total amount must be a number",
        },
        min: {
          args: [0],
          msg: "Total amount must be greater than or equal to 0",
        },
      },
    },
  },
  {
    tableName: "Carts",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",
  },
);

export default Cart;
