import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Product = sequelize.define(
  "Product",
  {
    productName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
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
        len: {
          args: [0, 255],
          msg: "Brand must not exceed 255 characters",
        },
      },
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Description cannot be empty",
        },
        len: {
          args: [1, 65535],
          msg: "Description must not be empty",
        },
      },
    },
    thumbnailUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: {
          msg: "Thumbnail URL must be a valid URL",
        },
      },
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Categories", key: "id" },
      validate: {
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
