import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const WorkShiftEmployee = sequelize.define(
  "WorkShiftEmployee",
  {
    workShiftId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "WorkShifts", key: "id" },
      validate: {
        notNull: { msg: "Work shift ID is required" },
        isInt: {
          msg: "Work shift ID must be an integer",
        },
        min: {
          args: [1],
          msg: "Work shift ID must be a positive number",
        },
      },
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Users", key: "id" },
      validate: {
        notNull: { msg: "Employee ID is required" },
        isInt: {
          msg: "Employee ID must be an integer",
        },
        min: {
          args: [1],
          msg: "Employee ID must be a positive number",
        },
      },
    },
    roleInShift: {
      type: DataTypes.ENUM("Cashier", "Staff"),
      allowNull: false,
      defaultValue: "Staff",
      validate: {
        isIn: {
          args: [["Cashier", "Staff"]],
          msg: "roleInShift must be either Cashier or Staff",
        },
      },
    },
    checkIn: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    checkOut: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    earnedWage: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0,
      validate: {
        isFloat: {
          msg: "Earned wage must be a number",
        },
        min: {
          args: [0],
          msg: "Earned wage must be greater than or equal to 0",
        },
      },
    },
  },
  {
    tableName: "WorkShiftEmployees",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",
  },
);

export default WorkShiftEmployee;
