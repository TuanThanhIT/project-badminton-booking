import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Beverage from "./beverage.js";
import Branch from "./branch.js";

const BeverageStock = sequelize.define(
  "BeverageStock",
  {
    beverageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Beverage, key: "id" },
      validate: { notNull: { msg: "Beverage ID is required" }, isInt: { msg: "Beverage ID must be integer" } },
    },
    branchId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Branch, key: "id" },
      validate: { notNull: { msg: "Branch ID is required" }, isInt: { msg: "Branch ID must be integer" } },
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: { msg: "Stock must be integer" },
        min: { args: [0], msg: "Stock must be >= 0" },
      },
    },
  },
  {
    tableName: "BeverageStocks",
    timestamps: false,
    indexes: [{ unique: true, fields: ["beverageId", "branchId"] }],
  },
);

export default BeverageStock;
