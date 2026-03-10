import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Order from "./order.js";
import ProductVariant from "./productVariant.js";

const OrderDetail = sequelize.define(
  "OrderDetail",
  {
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        notNull: { msg: "Quantity is required" },
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
        notNull: { msg: "Sub total is required" },
        isFloat: {
          msg: "Sub total must be a number",
        },
        min: {
          args: [0],
          msg: "Sub total must be greater than or equal to 0",
        },
      },
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Order, key: "id" },
      validate: {
        notNull: {
          msg: "Order ID is required",
        },
        isInt: {
          msg: "Order ID must be an integer",
        },
        min: {
          args: [1],
          msg: "Order ID must be a positive number",
        },
      },
    },
    variantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: ProductVariant, key: "id" },
      validate: {
        notNull: {
          msg: "Product variant ID is required",
        },
        isInt: {
          msg: "Product variant ID must be an integer",
        },
        min: {
          args: [1],
          msg: "Product variant ID must be a positive number",
        },
      },
    },
  },
  {
    tableName: "OrderDetails",
    timestamps: false,
  },
);

export default OrderDetail;
