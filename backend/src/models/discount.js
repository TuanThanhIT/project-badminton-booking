import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Discount = sequelize.define(
  "Discount",
  {
    code: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.STRING, allowNull: false },
    value: { type: DataTypes.DOUBLE, allowNull: false },
    startDate: { type: DataTypes.DATE, allowNull: false },
    endDate: { type: DataTypes.DATE, allowNull: false },
    minOrderAmount: { type: DataTypes.DOUBLE },
  },
  {
    tableName: "Discounts",
    timestamps: true,
    createdAt: "createdDate", // đổi tên createdAt
    updatedAt: "updatedDate", // đổi tên updatedAt
  }
);
export default Discount;
