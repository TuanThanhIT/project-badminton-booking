import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Cart from "./cart.js";
import ProductVariant from "./productVariant.js";

const CartItem = sequelize.define(
  "CartItem",
  {
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        notNull: {
          msg: "Quantity is required",
        },
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
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        notNull: {
          msg: "Sub total is required",
        },
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
      references: {
        model: Cart,
        key: "id",
      },
      validate: {
        notNull: {
          msg: "Cart ID is required",
        },
        isInt: {
          msg: "Cart ID must be an integer",
        },
        min: {
          args: [1],
          msg: "Cart ID must be a positive number",
        },
      },
    },
    variantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: ProductVariant,
        key: "id",
      },
      validate: {
        notNull: {
          msg: "Variant ID is required",
        },
        isInt: {
          msg: "Variant ID must be an integer",
        },
        min: {
          args: [1],
          msg: "Variant ID must be a positive number",
        },
      },
    },
  },
  {
    indexes: [
      {
        unique: true,
        fields: ["cartId", "variantId"],
      },
    ],
    tableName: "CartItems",
    timestamps: false,
  },
);

export default CartItem;
