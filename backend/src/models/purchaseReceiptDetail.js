import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import PurchaseReceipt from "./purchaseReceipt.js";
import ProductVariant from "./productVariant.js";
import Beverage from "./beverage.js";
import { STOCK_ITEM_TYPE } from "../constants/inventoryConstant.js";

const PurchaseReceiptDetail = sequelize.define(
  "PurchaseReceiptDetail",
  {
    purchaseReceiptId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: PurchaseReceipt, key: "id" },
      validate: {
        notNull: { msg: "Purchase receipt ID is required" },
        isInt: { msg: "Purchase receipt ID must be integer" },
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
    itemName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notNull: { msg: "Item name is required" },
        notEmpty: { msg: "Item name cannot be empty" },
        len: { args: [1, 255], msg: "Item name must be <= 255 characters" },
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: "Quantity must be integer" },
        min: { args: [1], msg: "Quantity must be greater than 0" },
      },
    },
    importPrice: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        isFloat: { msg: "Import price must be a number" },
        min: { args: [0], msg: "Import price must be >= 0" },
      },
    },
    totalPrice: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        isFloat: { msg: "Total price must be a number" },
        min: { args: [0], msg: "Total price must be >= 0" },
      },
    },
  },
  {
    tableName: "PurchaseReceiptDetails",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    validate: {
      itemReferenceMatchesType() {
        if (
          this.itemType === STOCK_ITEM_TYPE.PRODUCT_VARIANT &&
          (!this.variantId || this.beverageId)
        ) {
          throw new Error("Product variant detail requires variantId only");
        }

        if (
          this.itemType === STOCK_ITEM_TYPE.BEVERAGE &&
          (!this.beverageId || this.variantId)
        ) {
          throw new Error("Beverage detail requires beverageId only");
        }
      },
    },
    indexes: [
      { fields: ["purchaseReceiptId"] },
      { fields: ["itemType", "variantId"] },
      { fields: ["itemType", "beverageId"] },
    ],
  },
);

PurchaseReceiptDetail.beforeValidate((detail) => {
  detail.totalPrice = Number(detail.quantity || 0) * Number(detail.importPrice || 0);
});

export default PurchaseReceiptDetail;
