import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Branch from "./branch.js";
import ProductVariant from "./productVariant.js";
import Beverage from "./beverage.js";
import User from "./user.js";
import {
  STOCK_ITEM_TYPE,
  STOCK_REFERENCE_TYPE,
  STOCK_TRANSACTION_TYPE,
} from "../constants/inventoryConstant.js";

const StockTransaction = sequelize.define(
  "StockTransaction",
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
    itemType: {
      type: DataTypes.STRING(30),
      allowNull: false,
      validate: {
        isIn: {
          args: [Object.values(STOCK_ITEM_TYPE)],
          msg: "Item type is invalid",
        },
      },
    },
    variantId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: ProductVariant, key: "id" },
      validate: {
        isInt: { msg: "Variant ID must be integer" },
      },
    },
    beverageId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: Beverage, key: "id" },
      validate: {
        isInt: { msg: "Beverage ID must be integer" },
      },
    },
    type: {
      type: DataTypes.STRING(30),
      allowNull: false,
      validate: {
        isIn: {
          args: [Object.values(STOCK_TRANSACTION_TYPE)],
          msg: "Stock transaction type is invalid",
        },
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: "Quantity must be integer" },
        notZero(value) {
          if (Number(value) === 0) {
            throw new Error("Quantity must not be zero");
          }
        },
      },
    },
    beforeStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: "Before stock must be integer" },
        min: { args: [0], msg: "Before stock must be >= 0" },
      },
    },
    afterStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: "After stock must be integer" },
        min: { args: [0], msg: "After stock must be >= 0" },
      },
    },
    referenceType: {
      type: DataTypes.STRING(30),
      allowNull: true,
      validate: {
        isIn: {
          args: [Object.values(STOCK_REFERENCE_TYPE)],
          msg: "Reference type is invalid",
        },
      },
    },
    referenceId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        isInt: { msg: "Reference ID must be integer" },
      },
    },
    note: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        len: { args: [0, 500], msg: "Note must not exceed 500 characters" },
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
  },
  {
    tableName: "StockTransactions",
    timestamps: true,
    updatedAt: false,
    createdAt: "createdAt",
    validate: {
      itemReferenceMatchesType() {
        if (
          this.itemType === STOCK_ITEM_TYPE.PRODUCT_VARIANT &&
          (!this.variantId || this.beverageId)
        ) {
          throw new Error("Product variant transaction requires variantId only");
        }

        if (
          this.itemType === STOCK_ITEM_TYPE.BEVERAGE &&
          (!this.beverageId || this.variantId)
        ) {
          throw new Error("Beverage transaction requires beverageId only");
        }
      },
    },
    indexes: [
      { fields: ["branchId", "createdAt"] },
      { fields: ["itemType", "variantId", "createdAt"] },
      { fields: ["itemType", "beverageId", "createdAt"] },
      { fields: ["referenceType", "referenceId"] },
      { fields: ["createdBy", "createdAt"] },
    ],
  },
);

export default StockTransaction;
