import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import {
  DISCOUNT_USAGE_REFERENCE_TYPE,
  DISCOUNT_USAGE_STATUS,
} from "../constants/discountConstant.js";
import Discount from "./discount.js";
import User from "./user.js";

const DiscountUsage = sequelize.define(
  "DiscountUsage",
  {
    discountId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Discount, key: "id" },
      validate: {
        notNull: { msg: "Discount ID is required" },
        isInt: { msg: "Discount ID must be an integer" },
        min: { args: [1], msg: "Discount ID must be positive" },
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
      validate: {
        notNull: { msg: "User ID is required" },
        isInt: { msg: "User ID must be an integer" },
        min: { args: [1], msg: "User ID must be positive" },
      },
    },
    referenceType: {
      type: DataTypes.ENUM(...Object.values(DISCOUNT_USAGE_REFERENCE_TYPE)),
      allowNull: false,
      validate: {
        isIn: {
          args: [Object.values(DISCOUNT_USAGE_REFERENCE_TYPE)],
          msg: "Invalid discount usage reference type",
        },
      },
    },
    referenceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: "Reference ID must be an integer" },
        min: { args: [1], msg: "Reference ID must be positive" },
      },
    },
    discountAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        isDecimal: { msg: "Discount amount must be a number" },
        min: { args: [0], msg: "Discount amount must be >= 0" },
      },
    },
    status: {
      type: DataTypes.ENUM(...Object.values(DISCOUNT_USAGE_STATUS)),
      allowNull: false,
      defaultValue: DISCOUNT_USAGE_STATUS.PENDING,
      validate: {
        isIn: {
          args: [Object.values(DISCOUNT_USAGE_STATUS)],
          msg: "Invalid discount usage status",
        },
      },
    },
    usedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    restoredAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "DiscountUsages",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    indexes: [
      {
        unique: true,
        fields: ["discountId", "referenceType", "referenceId"],
      },
      {
        fields: ["userId", "discountId", "usedAt", "status"],
      },
    ],
  },
);

export default DiscountUsage;
