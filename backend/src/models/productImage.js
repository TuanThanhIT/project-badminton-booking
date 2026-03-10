import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Product from "./product.js";

const ProductImage = sequelize.define(
  "ProductImage",
  {
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: "Image URL is required" },
        isUrl: {
          msg: "Image URL must be a valid URL",
        },
      },
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Product, key: "id" },
      validate: {
        notNull: {
          msg: "Product ID is required",
        },
        isInt: {
          msg: "Product ID must be an integer",
        },
        min: {
          args: [1],
          msg: "Product ID must be a positive number",
        },
      },
    },
  },
  {
    tableName: "ProductImages",
    timestamps: false,
  },
);

export default ProductImage;
