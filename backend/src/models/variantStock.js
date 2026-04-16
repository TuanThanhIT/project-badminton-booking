import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import ProductVariant from "./productVariant.js";
import Branch from "./branch.js";

const VariantStock = sequelize.define(
  "VariantStock",
  {
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: { msg: "Stock must be integer" },
        min: { args: [0], msg: "Stock must be >= 0" },
      },
    },
    variantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: ProductVariant,
        key: "id",
      },
      validate: {
        notNull: { msg: "Variant ID is required" },
        isInt: { msg: "Variant ID must be integer" },
      },
    },
    branchId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Branch,
        key: "id",
      },
      validate: {
        notNull: { msg: "Branch ID is required" },
        isInt: { msg: "Branch ID must be integer" },
      },
    },
  },
  {
    tableName: "VariantStocks",
    timestamps: false,

    indexes: [
      {
        unique: true,
        fields: ["variantId", "branchId"],
      },
    ],
  },
);

export default VariantStock;
