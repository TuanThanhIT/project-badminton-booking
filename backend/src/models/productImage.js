import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const ProductImage = sequelize.define(
  "ProductImage",
  {
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: {
          msg: "Image URL must be a valid URL",
        },
      },
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Products", key: "id" },
      validate: {
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
