import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

// DraftBeverageItem (nước đang order / draft)
const DraftBeverageItem = sequelize.define(
  "DraftBeverageItem",
  {
    draftId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "DraftBookings", key: "id" },
    },
    beverageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Beverages", key: "id" },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    subTotal: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "DraftBeverageItems",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",
  }
);

export default DraftBeverageItem;
