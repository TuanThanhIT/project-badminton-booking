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
      validate: {
        notNull: { msg: "Branch ID is required" },
        isInt: { msg: "Branch ID must be integer" },
      },
    },
    managerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
      validate: {
        notNull: { msg: "Manager ID is required" },
        isInt: { msg: "Manager ID must be integer" },
      },
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Product, key: "id" },
      validate: {
        notNull: { msg: "Product ID is required" },
        isInt: { msg: "Product ID must be integer" },
      },
    },
    variantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: ProductVariant, key: "id" },
      validate: {
        notNull: { msg: "Variant ID is required" },
        isInt: { msg: "Variant ID must be integer" },
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { msg: "Quantity is required" },
        isInt: { msg: "Quantity must be integer" },
        min: { args: [1], msg: "Quantity must be >= 1" },
      },
    },
    sellingPrice: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0,
      validate: {
        notNull: { msg: "Selling price is required" },
        isFloat: { msg: "Selling price must be a number" },
        min: { args: [0], msg: "Selling price must be >= 0" },
      },
    },
    importPrice: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0,
      validate: {
        notNull: { msg: "Import price is required" },
        isFloat: { msg: "Import price must be a number" },
        min: { args: [0], msg: "Import price must be >= 0" },
      },
    },
    totalAmount: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0,
      validate: {
        notNull: { msg: "Total amount is required" },
        isFloat: { msg: "Total amount must be a number" },
        min: { args: [0], msg: "Total amount must be >= 0" },
      },
    },
    previousStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        notNull: { msg: "Previous stock is required" },
        isInt: { msg: "Previous stock must be integer" },
        min: { args: [0], msg: "Previous stock must be >= 0" },
      },
    },
    newStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        notNull: { msg: "New stock is required" },
        isInt: { msg: "New stock must be integer" },
        min: { args: [0], msg: "New stock must be >= 0" },
      },
    },
    note: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        len: {
          args: [0, 500],
          msg: "Note must not exceed 500 characters",
        },
      },
    },
  },
  {
    tableName: "InventoryReceipts",
    timestamps: true,
  },
);

export default InventoryReceipt;
