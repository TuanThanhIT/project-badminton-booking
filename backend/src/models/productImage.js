import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const ProductImage = sequelize.define(
  "ProductImage",
  {
    imageUrl: { type: DataTypes.STRING },
    productId: {
      type: DataTypes.INTEGER,
      references: { model: "Products", key: "id" },
      allowNull: false,
    },
  },
  { tableName: "ProductImages", timestamps: false }
);
export default ProductImage;
