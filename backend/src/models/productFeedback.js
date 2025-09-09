import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const ProductFeedback = sequelize.define(
  "ProductFeedback",
  {
    content: { type: DataTypes.STRING },
    rating: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    tableName: "ProductFeedbacks",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",
  }
);
export default ProductFeedback;
