import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import DraftBooking from "./draftBooking.js";
import Beverage from "./beverage.js";

// DraftBeverageItem (nước đang order / draft)
const DraftBeverageItem = sequelize.define(
  "DraftBeverageItem",
  {
    draftId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: DraftBooking, key: "id" },
      validate: {
        notNull: {
          msg: "Draft ID is required",
        },
        isInt: {
          msg: "Draft ID must be an integer",
        },
        min: {
          args: [1],
          msg: "Draft ID must be a positive number",
        },
      },
    },
    beverageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Beverage, key: "id" },
      validate: {
        notNull: {
          msg: "Beverage ID is required",
        },
        isInt: {
          msg: "Beverage ID must be an integer",
        },
        min: {
          args: [1],
          msg: "Beverage ID must be a positive number",
        },
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        notNull: { msg: "Quantity is required" },
        isInt: {
          msg: "Quantity must be an integer",
        },
        min: {
          args: [1],
          msg: "Quantity must be at least 1",
        },
      },
    },
    subTotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        notNull: { msg: "Sub total is required" },
        isFloat: {
          msg: "Sub total must be a number",
        },
        min: {
          args: [0],
          msg: "Sub total must be greater than or equal to 0",
        },
      },
    },
  },
  {
    tableName: "DraftBeverageItems",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
);

export default DraftBeverageItem;
