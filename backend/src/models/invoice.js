import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Invoice = sequelize.define(
  "Invoice",
  {
    amount: { type: DataTypes.DOUBLE, allowNull: false },
  },
  {
    tableName: "Invoices",
    timestamps: true, // bật tự động tạo
    createdAt: "createdDate", // đổi tên createdAt
    updatedAt: "updatedDate", // đổi tên updatedAt
  }
);
export default Invoice;
