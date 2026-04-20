import { DataTypes, INTEGER } from "sequelize";
import sequelize from "../config/db.js";
import Discount from "./discount.js";
import User from "./user.js";
import { DISCOUNT_TARGET_TYPE } from "../constants/discountConstant.js";

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
        min: {
          args: [1],
          msg: "Invalid Discount ID",
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
          msg: "Invalid User ID",
        },
      },
    },
    targetType: {
      type: DataTypes.ENUM(...Object.values(DISCOUNT_TARGET_TYPE)),
      allowNull: false,
      defaultValue: DISCOUNT_TARGET_TYPE.ORDER,
      validate: {
        isIn: {
          args: [Object.values(DISCOUNT_TARGET_TYPE)],
          msg: "Invalid discount target type",
        },
      },
    },
    targetId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { msg: "Target ID is required" },
        isInt: { msg: "Target ID must be an integer" },
        min: {
          args: [1],
          msg: "Invalid Target ID",
        },
      },
    },
  },
  {
    tableName: "DiscountUsages",
    timestamps: true,

    indexes: [
      {
        unique: true,
        fields: ["discountId", "userId", "targetType", "targetId"],
      },
      {
        fields: ["discountId"],
      },
      {
        fields: ["userId"],
      },
    ],
  },
);

export default DiscountUsage;
