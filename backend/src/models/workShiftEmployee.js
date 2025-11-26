import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
// WorkShiftEmployee (Nhân viên làm ca)
const WorkShiftEmployee = sequelize.define(
  "WorkShiftEmployee",
  {
    workShiftId: {
      type: DataTypes.INTEGER,
      references: { model: "WorkShifts", key: "id" },
      allowNull: false,
    },
    employeeId: {
      type: DataTypes.INTEGER,
      references: { model: "Users", key: "id" },
      allowNull: false,
    },
    checkIn: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    checkOut: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    earnedWage: { type: DataTypes.DOUBLE, defaultValue: 0, allowNull: false },
  },
  {
    tableName: "WorkShiftEmployees",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",
  }
);

export default WorkShiftEmployee;
