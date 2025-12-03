import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
// WorkShiftEmployee (Nhân viên làm ca)
const WorkShiftEmployee = sequelize.define(
  "WorkShiftEmployee",
  {
    workShiftId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "WorkShifts", key: "id" },
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Users", key: "id" },
    },

    roleInShift: {
      type: DataTypes.ENUM("Cashier", "Staff"),
      defaultValue: "Staff",
      allowNull: false,
    },

    checkIn: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    checkOut: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    earnedWage: {
      type: DataTypes.DOUBLE,
      defaultValue: 0,
    },
  },
  {
    tableName: "WorkShiftEmployees",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",
  }
);

export default WorkShiftEmployee;
