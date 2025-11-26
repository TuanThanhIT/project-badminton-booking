import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

// DraftProductItem (Sản phẩm cầu lông)
const DraftProductItem = sequelize.define(
  "DraftProductItem",
  {
    draftId: {
      type: DataTypes.INTEGER,
      references: { model: "DraftBookings", key: "id" },
      allowNull: false,
    },
    productVarientId: {
      type: DataTypes.INTEGER,
      references: { model: "ProductVarients", key: "id" },
      allowNull: false,
    },
    quantity: { type: DataTypes.INTEGER, defaultValue: 1, allowNull: false },
    subTotal: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "DraftProductItems",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",
  }
);

export default DraftProductItem;
