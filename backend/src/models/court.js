import { DataTypes } from "sequelize";
import sequelize from "../config/db";

const Court = sequelize.define(
  "Court",
  {
    name: { types: DataTypes.STRING(255), allowNull: false, unique: true },
    location: { types: DataTypes.STRING(255), allowNull: false },
    pricePerHour: { types: DataTypes.FLOAT, allowNull: false },
  },
  {
    tableName: "Courts",
    timestamps: false,
  }
);
export default Court;
