import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Beverage = sequelize.define(
  "Beverage",
  {
    name: { type: DataTypes.STRING, allowNull: false },
    thumbnailUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: { type: DataTypes.DOUBLE, allowNull: false },
    stock: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: false },
  },
  {
    tableName: "Beverages",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",
  }
);

export default Beverage;
