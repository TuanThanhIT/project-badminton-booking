import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Branch from "./branch.js";
import Product from "./product.js";
import ProductVariant from "./productVariant.js";
import User from "./user.js";

const InventoryReceipt = sequelize.define(
  "InventoryReceipt",
  {
    branchId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Branch, key: "id" },
    },
    managerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Product, key: "id" },
    },
    variantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: ProductVariant, key: "id" },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
        min: 1,
      },
    },
    sellingPrice: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0,
    },
    importPrice: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0,
    },
    totalAmount: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0,
    },
    previousStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    newStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    note: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
  },
  {
    tableName: "InventoryReceipts",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",
  },
);

export default InventoryReceipt;
