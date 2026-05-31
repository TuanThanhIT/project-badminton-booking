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
        isInt: { msg: "Quantity must be an integer" },
        min: { args: [1], msg: "Quantity must be at least 1" },
      },
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        notNull: { msg: "Unit price is required" },
        isFloat: { msg: "Unit price must be a number" },
        min: { args: [0], msg: "Unit price must be >= 0" },
      },
    },
    subTotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        notNull: { msg: "Sub total is required" },
        isFloat: { msg: "Sub total must be a number" },
        min: { args: [0], msg: "Sub total must be >= 0" },
      },
    },
    productName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notNull: { msg: "Product name is required" },
        notEmpty: { msg: "Product name cannot be empty" },
        len: {
          args: [1, 255],
          msg: "Product name must be <= 255 characters",
        },
      },
    },
    variantInfo: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        len: {
          args: [0, 255],
          msg: "Variant info must be <= 255 characters",
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
    indexes: [
      {
        unique: true,
        fields: ["orderId", "variantId"],
      },
      { fields: ["orderId"] },
      { fields: ["variantId"] },
    ],
  },
);

OrderDetail.beforeValidate((detail) => {
  detail.subTotal = detail.quantity * detail.unitPrice;
});

export default OrderDetail;
