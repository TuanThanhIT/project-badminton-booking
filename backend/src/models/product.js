import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Product = sequelize.define(
  "Product",
  {
    productName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    brand: { type: DataTypes.STRING(255) },
    description: { type: DataTypes.STRING, allowNull: false },
    thumbnailUrl: { type: DataTypes.STRING, allowNull: false },
    categoryId: {
      type: DataTypes.INTEGER,
      references: { model: "Categories", key: "id" },
      allowNull: false,
    },
  },
  {
    tableName: "Products",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",
  }
);
export default Product;
