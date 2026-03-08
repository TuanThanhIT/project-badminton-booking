import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const DraftProductItem = sequelize.define(
  "DraftProductItem",
  {
    draftId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "DraftBookings", key: "id" },
      validate: {
        isInt: {
          msg: "Draft ID must be an integer",
        },
        min: {
          args: [1],
          msg: "Draft ID must be a positive number",
        },
      },
    },
    productVarientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "ProductVarients", key: "id" },
      validate: {
        isInt: {
          msg: "Product variant ID must be an integer",
        },
        min: {
          args: [1],
          msg: "Product variant ID must be a positive number",
        },
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
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
      type: DataTypes.DOUBLE,
      allowNull: false,
      validate: {
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
    tableName: "DraftProductItems",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",
  },
);

export default DraftProductItem;
