import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Branch from "./branch.js";
import Supplier from "./supplier.js";
import User from "./user.js";
import { PURCHASE_RECEIPT_STATUS } from "../constants/inventoryConstant.js";

const PurchaseReceipt = sequelize.define(
  "PurchaseReceipt",
  {
    receiptCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notNull: { msg: "Receipt code is required" },
        notEmpty: { msg: "Receipt code cannot be empty" },
        len: {
          args: [1, 50],
          msg: "Receipt code must not exceed 50 characters",
        },
      },
    },
    branchId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Branch, key: "id" },
      validate: {
        notNull: { msg: "Branch ID is required" },
        isInt: { msg: "Branch ID must be integer" },
      },
    },
    supplierId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Supplier, key: "id" },
      validate: {
        notNull: { msg: "Supplier ID is required" },
        isInt: { msg: "Supplier ID must be integer" },
      },
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
      validate: {
        notNull: { msg: "Creator is required" },
        isInt: { msg: "Creator ID must be integer" },
      },
    },
    approvedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: User, key: "id" },
      validate: {
        isInt: { msg: "Approver ID must be integer" },
      },
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: PURCHASE_RECEIPT_STATUS.PENDING,
      validate: {
        isIn: {
          args: [Object.values(PURCHASE_RECEIPT_STATUS)],
          msg: "Purchase receipt status is invalid",
        },
      },
    },
    totalAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: { args: [0], msg: "Total amount must be >= 0" },
      },
    },
    note: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        len: { args: [0, 500], msg: "Note must not exceed 500 characters" },
      },
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "PurchaseReceipts",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    indexes: [
      { fields: ["receiptCode"] },
      { fields: ["branchId", "status"] },
      { fields: ["supplierId"] },
      { fields: ["createdBy"] },
      { fields: ["approvedBy"] },
    ],
  },
);

export default PurchaseReceipt;
