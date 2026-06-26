import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

// Gán mã khuyến mãi PRIVATE cho từng khách hàng cụ thể (1 mã dùng chung, nhiều user).
const DiscountUser = sequelize.define(
  "DiscountUser",
  {
    discountId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { msg: "Discount ID is required" },
        isInt: { msg: "Discount ID must be an integer" },
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { msg: "User ID is required" },
        isInt: { msg: "User ID must be an integer" },
      },
    },
    isUsed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    usedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "DiscountUsers",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    indexes: [
      {
        unique: true,
        fields: ["discountId", "userId"],
      },
    ],
  },
);

export default DiscountUser;
