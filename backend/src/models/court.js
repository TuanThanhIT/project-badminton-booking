import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Court = sequelize.define(
  "Court",
  {
    name: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    location: { type: DataTypes.STRING(255), allowNull: false },
    pricePerHour: { type: DataTypes.FLOAT, allowNull: false },
  },
  {
    tableName: "Courts",
    timestamps: false,
  }
);
export default Court;
