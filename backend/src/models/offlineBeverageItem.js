import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const OfflineBeverageItem = sequelize.define(
  "OfflineBeverageItem",
  {
    offlineBookingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "OfflineBookings", key: "id" },
      validate: {
        isInt: {
          msg: "Offline booking ID must be an integer",
        },
        min: {
          args: [1],
          msg: "Offline booking ID must be a positive number",
        },
      },
    },
    beverageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Beverages", key: "id" },
      validate: {
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
      defaultValue: 0,
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
    tableName: "OfflineBeverageItems",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",
  },
);

export default OfflineBeverageItem;
