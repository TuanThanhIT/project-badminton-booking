import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const ProductVarient = sequelize.define(
  "ProductVarient",
  {
    sku: { type: DataTypes.STRING(255) },
    price: { type: DataTypes.DOUBLE, allowNull: false },
    stock: { type: DataTypes.INTEGER, allowNull: false },
    discount: { type: DataTypes.FLOAT },
    color: { type: DataTypes.STRING(255) },
    size: { type: DataTypes.STRING(255) },
    material: { type: DataTypes.STRING },
  },
  {
    tableName: "ProductVarients",
    timestamps: false,
  }
);
export default ProductVarient;
