import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./user.js";
import { ORDER_GROUP_STATUS } from "../constants/orderConstant.js";
import Discount from "./discount.js";

const OrderGroup = sequelize.define(
  "OrderGroup",
  {
    totalAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        notNull: { msg: "Total amount is required" },
        isDecimal: { msg: "Total amount must be a number" },
        min: {
          args: [0],
          msg: "Total amount must be >= 0",
        },
      },
    },
    totalShippingFee: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        notNull: { msg: "Total shipping fee is required" },
        isDecimal: { msg: "Shipping fee must be a number" },
        min: {
          args: [0],
          msg: "Shipping fee must be >= 0",
        },
      },
    },
    discountId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: Discount, key: "id" },
      validate: {
        isInt: { msg: "Discount ID must be an integer" },
        min: {
          args: [1],
          msg: "Discount ID must be positive",
        },
      },
    },
    discountAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      defaultValue: 0,
      validate: {
        isDecimal: { msg: "Discount must be a number" },
        min: {
          args: [0],
          msg: "Discount must be >= 0",
        },
      },
    },
    finalAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        notNull: { msg: "Final amount is required" },
        isDecimal: { msg: "Final amount must be a number" },
        min: {
          args: [0],
          msg: "Final amount must be >= 0",
        },
      },
    },
    status: {
      type: DataTypes.ENUM(...Object.values(ORDER_GROUP_STATUS)),
      allowNull: false,
      defaultValue: ORDER_GROUP_STATUS.PENDING_PAYMENT,
      validate: {
        notNull: { msg: "Order group status is required" },
        isIn: {
          args: [Object.values(ORDER_GROUP_STATUS)],
          msg: "Invalid order group status",
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
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
      validate: {
        notNull: { msg: "User ID is required" },
        isInt: { msg: "User ID must be an integer" },
        min: {
          args: [1],
          msg: "User ID must be positive",
        },
      },
    },
  },
  {
    tableName: "OrderGroups",
    timestamps: true,
    indexes: [{ fields: ["userId"] }],
  },
);

OrderGroup.beforeValidate((group) => {
  const expected =
    Number(group.totalAmount) +
    Number(group.totalShippingFee) -
    Number(group.discountAmount);

  if (Number(group.finalAmount) !== expected) {
    throw new Error("Invalid final amount");
  }
});

export default OrderGroup;
