import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Category = sequelize.define(
  "Category",
  {
    cateName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    menuGroup: {
      type: DataTypes.STRING,
      allowNull: false,
    }, // 👈 Thêm cột nhóm menu để hiển thị
  },
  {
    tableName: "Categories",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",
  }
);

export default Category;
