import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const OrderDetail = sequelize.define(
  "OrderDetail",
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
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Orders", key: "id" },
      validate: {
        isInt: {
          msg: "Order ID must be an integer",
        },
        min: {
          args: [1],
          msg: "Order ID must be a positive number",
        },
      },
    },
    varientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "ProductVarients", key: "id" },
      validate: {
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
