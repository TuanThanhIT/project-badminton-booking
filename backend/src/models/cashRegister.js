import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
// CashRegister (Doanh thu ca)
const CashRegister = sequelize.define(
  "CashRegister",
  {
    workShiftEmployeeId: {
      type: DataTypes.INTEGER,
      references: { model: "WorkShiftEmployees", key: "id" },
      allowNull: false,
    },
    openingCash: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    closingCash: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    revenue: { type: DataTypes.DOUBLE, defaultValue: 0, allowNull: false },
  },
  {
    tableName: "CashRegisters",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",
  }
);
export default CashRegister;
