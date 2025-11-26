import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
// OfflineProductItem (Sản phẩm cầu lông đã thanh toán)
const OfflineProductItem = sequelize.define(
  "OfflineProductItem",
  {
    offlineBookingId: {
      type: DataTypes.INTEGER,
      references: { model: "OfflineBookings", key: "id" },
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
    tableName: "OfflineProductItems",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",
  }
);

export default OfflineProductItem;
