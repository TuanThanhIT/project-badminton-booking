import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const CartItem = sequelize.define(
  "CartItem",
  {
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        isInt: {
          msg: "Quantity must be an integer",
        },
        min: {
          args: [1],
          msg: "Quantity must be at least 1",
        },
      },
    },
    subTotal: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      validate: {
        isFloat: {
          msg: "Sub total must be a number",
        },
        min: {
          args: [0],
          msg: "Sub total must be greater than or equal to 0",
        },
      },
    },
    cartId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: {
          msg: "Cart ID must be an integer",
        },
        min: {
          args: [1],
          msg: "Cart ID must be a positive number",
        },
      },
      references: {
        model: "Carts",
        key: "id",
      },
    },
    varientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: {
          msg: "Variant ID must be an integer",
        },
        min: {
          args: [1],
          msg: "Variant ID must be a positive number",
        },
      },
      references: {
        model: "ProductVarients",
        key: "id",
      },
    },
  },
  {
    tableName: "CartItems",
    timestamps: false,
  },
);

export default CartItem;
