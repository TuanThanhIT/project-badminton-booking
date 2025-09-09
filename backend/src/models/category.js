import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Category = sequelize.define(
  "Category",
  {
    cateName: { type: DataTypes.STRING, allowNull: false, unique: true },
  },
  {
    tableName: "Categories",
    timestamps: true,
    createdAt: "createdDate", // đổi tên createdAt
    updatedAt: "updatedDate", // đổi tên updatedAt
  }
);
export default Category;
