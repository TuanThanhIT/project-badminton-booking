import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import { ORDER_STATUS } from "../constants/orderConstant.js";

const Order = sequelize.define(
  "Order",
  {
    orderStatus: {
      type: DataTypes.ENUM(...Object.values(ORDER_STATUS)),
      allowNull: false,
      defaultValue: ORDER_STATUS.PENDING,
      validate: {
        isIn: {
          args: [Object.values(ORDER_STATUS)],
          msg: "Invalid order status",
        },
      },
    },
    totalAmount: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      validate: {
        isFloat: {
          msg: "Total amount must be a number",
        },
        min: {
          args: [0.01],
          msg: "Total amount must be greater than 0",
        },
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Users", key: "id" },
      validate: {
        isInt: {
          msg: "User ID must be an integer",
        },
        min: {
          args: [1],
          msg: "User ID must be a positive number",
        },
      },
    },
    discountId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "Discounts", key: "id" },
      validate: {
        isInt: {
          msg: "Discount ID must be an integer",
        },
        min: {
          args: [1],
          msg: "Discount ID must be a positive number",
        },
      },
    },
    note: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        len: {
          args: [0, 255],
          msg: "Note must be at most 255 characters",
        },
      },
    },
    cancelledBy: {
      type: DataTypes.ENUM("User", "Employee", "System"),
      allowNull: true,
    },
    cancelReason: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        len: {
          args: [5, 255],
          msg: "Cancel reason must be between 5 and 255 characters",
        },
      },
    },
  },
  {
    tableName: "Orders",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",
  },
);

export default Order;
