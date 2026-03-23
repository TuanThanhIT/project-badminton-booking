import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import { ORDER_STATUS } from "../constants/orderConstant.js";
import { CANCELLED_BY } from "../constants/bookingConstant.js";
import Branch from "./branch.js";
import User from "./user.js";
import Discount from "./discount.js";

const Order = sequelize.define(
  "Order",
  {
    orderStatus: {
      type: DataTypes.ENUM(...Object.values(ORDER_STATUS)),
      allowNull: false,
      defaultValue: ORDER_STATUS.PENDING,
      validate: {
        notNull: { msg: "Order status is required" },
        isIn: {
          args: [Object.values(ORDER_STATUS)],
          msg: "Invalid order status",
        },
      },
    },
    subtotal: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      validate: {
        notNull: { msg: "Subtotal is required" },
        isFloat: { msg: "Subtotal must be a number" },
        min: { args: [0], msg: "Subtotal must be >= 0" },
      },
    },
    shippingFee: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0,
      validate: {
        notNull: { msg: "Shipping fee is required" },
        isFloat: { msg: "Shipping fee must be a number" },
        min: { args: [0], msg: "Shipping fee must be >= 0" },
      },
    },
    totalAmount: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      validate: {
        notNull: { msg: "Total amount is required" },
        isFloat: { msg: "Total amount must be a number" },
        min: { args: [0], msg: "Total amount must be >= 0" },
      },
    },
    shippingName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notNull: { msg: "Shipping name is required" },
        notEmpty: { msg: "Shipping name cannot be empty" },
        len: {
          args: [2, 255],
          msg: "Shipping name must be between 2 and 255 characters",
        },
      },
    },
    shippingPhone: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notNull: { msg: "Phone number is required" },
        is: {
          args: /^[0-9]{9,11}$/,
          msg: "Phone number must contain 9 to 11 digits",
        },
      },
    },
    shippingAddress: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notNull: { msg: "Address is required" },
        notEmpty: { msg: "Address cannot be empty" },
        len: {
          args: [5, 255],
          msg: "Address must be between 5 and 255 characters",
        },
      },
    },
    shippingDistance: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        isFloat: { msg: "Distance must be a number" },
        min: { args: [0], msg: "Distance must be >= 0" },
      },
    },
    branchId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Branch, key: "id" },
      validate: {
        notNull: {
          msg: "Branch ID is required",
        },
        isInt: {
          msg: "Branch ID must be an integer",
        },
        min: {
          args: [1],
          msg: "Branch ID must be a positive number",
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
    discountId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: Discount, key: "id" },
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
      type: DataTypes.ENUM(...Object.values(CANCELLED_BY)),
      allowNull: true,
      validate: {
        isIn: {
          args: [Object.values(CANCELLED_BY)],
          msg: "Invalid cancelled by value",
        },
      },
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
    indexes: [
      { fields: ["userId"] },
      { fields: ["branchId"] },
      { fields: ["createdDate"] },
    ],
  },
);

Order.beforeValidate((order) => {
  if (order.subtotal != null && order.shippingFee != null) {
    const expected = order.subtotal + order.shippingFee;

    if (order.totalAmount !== expected) {
      throw new Error("Invalid total amount");
    }
  }
});

export default Order;
