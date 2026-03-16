import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Category from "./category.js";

const Product = sequelize.define(
  "Product",
  {
    productName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      set(value) {
        this.setDataValue("productName", value?.trim());
      },
      validate: {
        notNull: { msg: "Product name is required" },
        notEmpty: {
          msg: "Product name cannot be empty",
        },
        len: {
          args: [2, 255],
          msg: "Product name must be between 2 and 255 characters",
        },
      },
    },
    brand: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notNull: { msg: "Brand is required" },
        len: {
          args: [0, 255],
          msg: "Brand must not exceed 255 characters",
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull: { msg: "Description is required" },
        notEmpty: {
          msg: "Description cannot be empty",
        },
        len: {
          args: [1, 65535],
          msg: "Description must not exceed 65535 characters",
        },
      },
    },
    thumbnailUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: "Thumbnail URL is required" },
        isUrl: {
          msg: "Thumbnail URL must be a valid URL",
        },
      },
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Category, key: "id" },
      validate: {
        notNull: {
          msg: "Category ID is required",
        },
        isInt: {
          msg: "Category ID must be an integer",
        },
        min: {
          args: [1],
          msg: "Category ID must be a positive number",
        },
      },
    },
  },
  {
    tableName: "Products",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",
  },
);

export default Product;
