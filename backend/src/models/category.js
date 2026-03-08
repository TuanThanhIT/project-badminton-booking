import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Category = sequelize.define(
  "Category",
  {
    cateName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      set(value) {
        this.setDataValue("cateName", value?.trim());
      },
      validate: {
        notNull: {
          msg: "Category name is required",
        },
        notEmpty: {
          msg: "Category name cannot be empty",
        },
        len: {
          args: [1, 255],
          msg: "Category name must not exceed 255 characters",
        },
      },
    },
    menuGroup: {
      type: DataTypes.STRING(100),
      allowNull: false,
      set(value) {
        this.setDataValue("menuGroup", value?.trim());
      },
      validate: {
        notNull: {
          msg: "Menu group is required",
        },
        notEmpty: {
          msg: "Menu group cannot be empty",
        },
        len: {
          args: [1, 100],
          msg: "Menu group must not exceed 100 characters",
        },
      },
    },
  },
  {
    tableName: "Categories",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",
  },
);

export default Category;
