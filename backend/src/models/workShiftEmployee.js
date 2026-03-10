import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import { ROLE_IN_SHIFT } from "../constants/workShiftConstant.js";
import WorkShift from "./workShift.js";
import User from "./user.js";

const WorkShiftEmployee = sequelize.define(
  "WorkShiftEmployee",
  {
    workShiftId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: WorkShift, key: "id" },
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
      references: { model: User, key: "id" },
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
      type: DataTypes.ENUM(...Object.values(ROLE_IN_SHIFT)),
      allowNull: false,
      defaultValue: ROLE_IN_SHIFT.STAFF,
      validate: {
        notNull: { msg: "Role in shift is required" },
        isIn: {
          args: [["Cashier", "Staff"]],
          msg: "roleInShift must be either Cashier or Staff",
        },
      },
    },
    checkIn: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: {
          msg: "Check-in must be a valid date",
        },
      },
    },
    checkOut: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: {
          msg: "Check-out must be a valid date",
        },
      },
    },
    hourlyRate: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0,
      validate: {
        notNull: {
          msg: "Hourly rate is required",
        },
        isFloat: {
          msg: "Hourly rate must be a number",
        },
        min: {
          args: [0],
          msg: "Earned wage must be greater than or equal to 0",
        },
      },
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
